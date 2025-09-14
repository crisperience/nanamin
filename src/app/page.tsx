'use client'

import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Paper,
  Progress,
  Slider,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { Dropzone, FileWithPath } from '@mantine/dropzone'
import { notifications } from '@mantine/notifications'
import {
  IconBowlChopsticks,
  IconBrandGithub,
  IconCheck,
  IconDownload,
  IconFileZip,
  IconMail,
  IconPlus,
  IconShield,
  IconUpload,
  IconX
} from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import styles from './page.module.css'

interface CompressionStats {
  originalSize: number
  compressedSize: number
  savings: number
  filesProcessed: number
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function Home() {
  const [files, setFiles] = useState<FileWithPath[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [quality, setQuality] = useState(85)
  const [stats, setStats] = useState<CompressionStats | null>(null)
  const [currentFile, setCurrentFile] = useState<string>('')
  const [compressedFiles, setCompressedFiles] = useState<Blob[]>([])
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const handleDrop = useCallback((droppedFiles: FileWithPath[]) => {
    const comicFiles = droppedFiles.filter(file => {
      const name = file.name.toLowerCase()
      return name.endsWith('.cbz') || name.endsWith('.cbr')
    })

    if (comicFiles.length === 0) {
      notifications.show({
        title: 'Invalid files',
        message: 'Please drop only CBZ or CBR files',
        color: 'red',
        icon: <IconX size={16} />,
      })
      return
    }

    // Check for oversized files and total count
    const maxSize = 1024 * 1024 ** 2 // 1GB per file
    const maxFiles = 50 // Maximum number of files
    const oversizedFiles = comicFiles.filter(file => file.size > maxSize)

    if (oversizedFiles.length > 0) {
      notifications.show({
        title: 'Files too large',
        message: `Some files exceed 1GB limit: ${oversizedFiles.map(f => f.name).join(', ')}`,
        color: 'red',
        icon: <IconX size={16} />,
      })
      return
    }

    if (comicFiles.length > maxFiles) {
      notifications.show({
        title: 'Too many files',
        message: `Maximum ${maxFiles} files allowed. You selected ${comicFiles.length} files.`,
        color: 'red',
        icon: <IconX size={16} />,
      })
      return
    }

    setFiles(comicFiles)
    setStats(null)
    setCompressedFiles([])

    // Files loaded - no notification needed
  }, [])

  const compressFiles = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    setProgress(0)
    setCompressedFiles([])

    // Create abort controller
    const controller = new AbortController()
    setAbortController(controller)

    try {
      // Import browser-image-compression
      const imageCompression = (await import('browser-image-compression')).default

      const totalFiles = files.length
      let originalSize = 0
      let compressedSize = 0
      const processedFiles: Blob[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setCurrentFile(file.name)
        setProgress((i / totalFiles) * 100)

        originalSize += file.size

        // Check if aborted
        if (controller.signal.aborted) {
          throw new Error('Compression aborted')
        }

        // Process CBZ/CBR file
        const compressedCbz = await compressCbzFile(file, quality, imageCompression, controller.signal, (progress: number) => {
          const overallProgress = ((i + progress / 100) / totalFiles) * 100
          setProgress(overallProgress)
        })

        compressedSize += compressedCbz.size
        processedFiles.push(compressedCbz)
      }

      setProgress(100)
      setCompressedFiles(processedFiles)
      const actualSavings = ((originalSize - compressedSize) / originalSize) * 100

      setStats({
        originalSize,
        compressedSize,
        savings: actualSavings,
        filesProcessed: files.length
      })

      // Compression complete - no notification needed
    } catch (error) {
      console.error('Compression failed:', error)
      // Compression failed - handle silently or show inline error
    } finally {
      setIsProcessing(false)
      setCurrentFile('')
      setAbortController(null)
    }
  }

  // Helper function to get MIME type from file extension
  const getImageMimeType = (fileName: string): string => {
    const ext = fileName.toLowerCase().split('.').pop()
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg'
      case 'png':
        return 'image/png'
      case 'webp':
        return 'image/webp'
      default:
        return 'image/jpeg' // fallback
    }
  }

  // Function to compress CBZ/CBR files using WebP
  const compressCbzFile = async (
    file: File,
    quality: number,
    imageCompression: (file: File, options: {
      fileType?: string;
      initialQuality?: number;
      alwaysKeepResolution?: boolean;
      useWebWorker?: boolean;
      signal?: AbortSignal;
    }) => Promise<File>,
    abortSignal: AbortSignal,
    onProgress: (progress: number) => void
  ): Promise<Blob> => {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    // Read the original CBZ/CBR file
    const originalZip = await JSZip.loadAsync(file)
    const files = Object.keys(originalZip.files)
    const imageFiles = files.filter(fileName =>
      /\.(jpg|jpeg|png|webp)$/i.test(fileName)
    )

    let processedCount = 0

    // Process each image file
    for (const fileName of files) {
      // Check if aborted
      if (abortSignal.aborted) {
        throw new Error('Compression aborted')
      }

      const fileData = originalZip.files[fileName]

      if (fileData.dir) {
        // Skip directories
        continue
      }

      if (imageFiles.includes(fileName)) {
        // Compress image files to WebP
        const imageBlob = await fileData.async('blob')

        // Create a proper File object with correct MIME type
        const imageFile = new File([imageBlob], fileName, {
          type: getImageMimeType(fileName)
        })

        // Convert quality (0-100) to initialQuality (0-1)
        const initialQuality = quality / 100

        const compressedImage = await imageCompression(imageFile, {
          fileType: 'image/webp',
          initialQuality: initialQuality,
          alwaysKeepResolution: true,
          useWebWorker: true,
          signal: abortSignal, // Pass abort signal to image compression
        })

        // Change extension to .webp
        const webpFileName = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp')
        zip.file(webpFileName, compressedImage)
      } else {
        // Copy non-image files as-is
        const fileContent = await fileData.async('uint8array')
        zip.file(fileName, fileContent)
      }

      processedCount++
      onProgress((processedCount / files.length) * 100)
    }

    // Generate compressed CBZ
    return await zip.generateAsync({ type: 'blob' })
  }

  const downloadFiles = () => {
    compressedFiles.forEach((blob, index) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `compressed_${files[index].name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  const resetCompression = () => {
    setFiles([])
    setStats(null)
    setCompressedFiles([])
    setProgress(0)
    setCurrentFile('')
    setAbortController(null)
  }

  const abortCompression = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: '#1e1e2e',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'auto',
        padding: '20px 0',
      }}
    >
      <Container size="md" className={styles.container} style={{ width: '100%', display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <Stack gap={50} align="center" className={styles.mainStack} style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
          {/* Header Section */}
          <Stack gap="md" align="center">
            <Stack gap="sm" align="center">
              <Title order={1} size="h1" fw={900} c="white" lh={1.2}>
                Nanamin
              </Title>
              <Text size="lg" c="gray.3" fw={500} lh={1.3}>
                Comic & Manga Compressor
              </Text>
            </Stack>

            <Text size="lg" ta="center" c="gray.1" maw={600} lh={1.4} className={styles.headerText}>
              Advanced compression that saves{' '}
              <Text span fw={700} c="green.4">30-70% space</Text>{' '}
              while preserving visual quality.
            </Text>

            {/* Feature badges */}
            <Group gap="lg" justify="center" className={styles.featureGroup}>
              <Badge
                leftSection={<IconShield size={14} />}
                variant="light"
                color="green"
                size="lg"
                radius="xl"
                className={styles.featureBadge}
              >
                100% Private
              </Badge>
            </Group>
          </Stack>

          {/* Main Interface Card */}
          <Card
            shadow="xl"
            padding="xl"
            radius="xl"
            className={styles.mainCard}
            style={{
              width: '100%',
              maxWidth: '600px',
              background: 'rgba(55, 58, 64, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Stack gap="xl" className={styles.cardStack}>
              {/* Dropzone - only show when no files are selected */}
              {files.length === 0 && (
                <Dropzone
                  onDrop={handleDrop}
                  accept={[
                    'application/x-cbz',
                    'application/x-cbr',
                    'application/vnd.comicbook+zip',
                    'application/vnd.comicbook-rar'
                  ]}
                  maxSize={1024 * 1024 ** 2} // 1GB - increased for large comic collections
                  radius="xl"
                  h={200}
                  style={{
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Group justify="center" gap="xl" mih={160} style={{ pointerEvents: 'none' }}>
                    <Dropzone.Accept>
                      <IconUpload
                        size={52}
                        color="var(--mantine-color-green-6)"
                        stroke={1.5}
                      />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                      <IconX
                        size={52}
                        color="var(--mantine-color-red-6)"
                        stroke={1.5}
                      />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                      <IconFileZip
                        size={52}
                        color="rgba(255, 255, 255, 0.6)"
                        stroke={1.5}
                      />
                    </Dropzone.Idle>

                    <div>
                      <Text size="xl" inline c="white" fw={600}>
                        Drop your CBZ or CBR files here
                      </Text>
                      <Text size="sm" c="gray.3" inline mt={7}>
                        or click to browse your files
                      </Text>
                    </div>
                  </Group>
                </Dropzone>
              )}

              {/* File List */}
              {files.length > 0 && (
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={500} c="white">
                      Selected Files ({files.length})
                    </Text>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={() => {
                        setFiles([])
                        setStats(null)
                        setCompressedFiles([])
                      }}
                    >
                      Clear Files
                    </Button>
                  </Group>
                  <Stack gap="xs" className={styles.fileList} style={{ overflowY: 'auto' }}>
                    {files.map((file, index) => (
                      <Paper key={index} p="sm" radius="md"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Group gap="sm">
                          <ThemeIcon size="sm" color="violet" variant="light">
                            <IconFileZip size={16} />
                          </ThemeIcon>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text size="sm" fw={500} c="white" truncate>
                              {file.name}
                            </Text>
                            <Text size="xs" c="gray.3">
                              {formatFileSize(file.size)}
                            </Text>
                          </div>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </Stack>
              )}

              {/* Quality Control - Hide after compression is complete */}
              {!(stats && compressedFiles.length > 0) && (
                <Paper p="md" radius="md"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Stack gap="lg">
                    <Group justify="space-between">
                      <div>
                        <Text size="sm" fw={500} c="white">
                          Compression Quality
                        </Text>
                      </div>
                      <Badge
                        color={quality >= 90 ? 'green' : quality >= 70 ? 'yellow' : 'orange'}
                        variant="light"
                        size="lg"
                      >
                        {quality}%
                      </Badge>
                    </Group>

                    <Slider
                      value={quality}
                      onChange={setQuality}
                      min={30}
                      max={100}
                      step={5}
                      marks={[
                        { value: 30, label: '30%' },
                        { value: 50, label: '50%' },
                        { value: 70, label: '70%' },
                        { value: 90, label: '90%' },
                      ]}
                      color="violet"
                      size="md"
                    />

                    <Text size="xs" c="gray.4" ta="center" mt="sm">
                      Move slider left for smaller files or right for better quality
                    </Text>
                  </Stack>
                </Paper>
              )}

              {/* Action Button - Hide when results are showing */}
              {!(stats && compressedFiles.length > 0) && (
                <Button
                  onClick={compressFiles}
                  disabled={files.length === 0 || isProcessing}
                  size="xl"
                  radius="xl"
                  variant="filled"
                  color="violet"
                  loading={isProcessing}
                  loaderProps={{ type: 'dots' }}
                  fullWidth
                >
                  {isProcessing
                    ? 'Processing...'
                    : files.length > 0
                      ? `Compress ${files.length} file${files.length !== 1 ? 's' : ''}`
                      : 'Select files to compress'
                  }
                </Button>
              )}

              {/* Progress */}
              {isProcessing && (
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="white">
                      {currentFile ? `Processing: ${currentFile}` : 'Initializing...'}
                    </Text>
                    <Text size="sm" fw={700} c="violet.4">
                      {Math.round(progress)}%
                    </Text>
                  </Group>
                  <Progress
                    value={progress}
                    color="violet"
                    size="lg"
                    radius="xl"
                    animated
                  />
                  <Button
                    onClick={abortCompression}
                    variant="outline"
                    color="red"
                    size="sm"
                    radius="xl"
                    leftSection={<IconX size={14} />}
                  >
                    Cancel
                  </Button>
                </Stack>
              )}

              {/* Results */}
              {stats && compressedFiles.length > 0 && (
                <Paper p="md" radius="md"
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <Stack gap="md">
                    <Group gap="sm">
                      <ThemeIcon size="sm" color="green" variant="light">
                        <IconCheck size={16} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={600} c="green.4">
                          Compression Complete
                        </Text>
                      </div>
                    </Group>

                    <Stack gap="md" align="center">
                      {/* Main Compression Result */}
                      <Paper p="lg" ta="center" radius="lg"
                        style={{
                          background: stats.savings > 0
                            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08))'
                            : 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(251, 146, 60, 0.08))',
                          border: stats.savings > 0
                            ? '1px solid rgba(34, 197, 94, 0.25)'
                            : '1px solid rgba(251, 146, 60, 0.25)',
                          minWidth: '160px',
                          maxWidth: '200px'
                        }}
                      >
                        <Text
                          size="2.5rem"
                          fw={900}
                          c={stats.savings > 0 ? "green.4" : "orange.4"}
                          lh={1}
                        >
                          {stats.savings > 0 ? '-' : '+'}{Math.round(Math.abs(stats.savings))}%
                        </Text>
                        <Text size="md" c="white" fw={500} mt="xs">
                          {stats.savings > 0 ? 'Space Saved' : 'Size Increased'}
                        </Text>
                      </Paper>

                      {/* File Size Details */}
                      <Group gap="xl" justify="center">
                        <Stack gap="xs" align="center">
                          <Text size="xs" c="gray.4" tt="uppercase" fw={600}>Original</Text>
                          <Text size="lg" c="gray.2" fw={500}>
                            {formatFileSize(stats.originalSize)}
                          </Text>
                        </Stack>

                        <Box style={{
                          width: '40px',
                          height: '2px',
                          background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(139, 92, 246, 0.8), rgba(255,255,255,0.3))',
                          borderRadius: '1px'
                        }} />

                        <Stack gap="xs" align="center">
                          <Text size="xs" c="gray.4" tt="uppercase" fw={600}>Compressed</Text>
                          <Text size="lg" c="violet.4" fw={600}>
                            {formatFileSize(stats.compressedSize)}
                          </Text>
                        </Stack>
                      </Group>
                    </Stack>

                    <Group grow>
                      <Button
                        onClick={downloadFiles}
                        color="green"
                        size="md"
                        radius="xl"
                        leftSection={<IconDownload size={16} />}
                        style={{ fontSize: '14px' }}
                      >
                        Download {compressedFiles.length} file{compressedFiles.length > 1 ? 's' : ''}
                      </Button>
                      <Button
                        onClick={resetCompression}
                        variant="outline"
                        color="violet"
                        size="md"
                        radius="xl"
                        leftSection={<IconPlus size={16} />}
                        style={{ fontSize: '14px' }}
                      >
                        Compress Another
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Card>

          {/* Support Section */}
          <Card
            shadow="lg"
            padding="lg"
            radius="xl"
            className={styles.supportCard}
            style={{
              width: '100%',
              maxWidth: '600px',
              background: 'rgba(55, 58, 64, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Stack gap="md" align="center">
              <div>
                <Title order={4} c="white" ta="center">Support Nanamin</Title>
                <Text size="sm" c="gray.3" ta="center" mt="xs">
                  Keep Nanamin running and help us build new features
                </Text>
              </div>

              {/* Desktop: All buttons in horizontal row */}
              <Group gap="sm" justify="center" className={styles.buttonGroup} visibleFrom="sm">
                <Button
                  component="a"
                  href="https://buymeacoffee.com/crispsolutions"
                  target="_blank"
                  size="md"
                  radius="xl"
                  variant="filled"
                  color="orange"
                  className={styles.contactButton}
                  leftSection={<IconBowlChopsticks size={16} />}
                >
                  Buy us instant ramen
                </Button>
                <Button
                  component="a"
                  href="https://github.com/crisperience/nanamin"
                  target="_blank"
                  size="md"
                  radius="xl"
                  variant="outline"
                  color="gray"
                  leftSection={<IconBrandGithub size={16} />}
                  className={styles.contactButton}
                >
                  GitHub
                </Button>
              </Group>

              {/* Mobile: Two-row layout */}
              <Stack gap="sm" align="center" className={styles.buttonGroup} hiddenFrom="sm">
                {/* Row 1: Coffee button full width */}
                <Button
                  component="a"
                  href="https://buymeacoffee.com/crispsolutions"
                  target="_blank"
                  size="md"
                  radius="xl"
                  variant="filled"
                  color="orange"
                  className={styles.contactButton}
                  fullWidth
                  leftSection={<IconBowlChopsticks size={16} />}
                >
                  Buy us instant ramen
                </Button>

                {/* Row 2: GitHub + Contact with responsive sizing */}
                <div className={styles.mobileButtonRow}>
                  <Button
                    component="a"
                    href="https://github.com/crisperience/nanamin"
                    target="_blank"
                    size="md"
                    radius="xl"
                    variant="outline"
                    color="gray"
                    leftSection={<IconBrandGithub size={16} />}
                    className={styles.contactButton}
                  >
                    GitHub
                  </Button>
                  <Button
                    component="a"
                    href="mailto:martin@crisp.hr"
                    size="md"
                    radius="xl"
                    variant="outline"
                    color="violet"
                    leftSection={<IconMail size={16} />}
                    className={styles.contactButton}
                  >
                    Contact
                  </Button>
                </div>
              </Stack>
            </Stack>
          </Card>

          <Text size="sm" c="gray.4" ta="center" className={styles.footerText}>
            Made with care for comic and manga lovers worldwide
          </Text>
        </Stack>
      </Container>

      {/* Floating Contact Widget */}
      <Box
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
        visibleFrom="sm"
      >
        <ThemeIcon
          size={56}
          radius="xl"
          color="violet"
          style={{
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onClick={() => window.open('mailto:martin@crisp.hr', '_blank')}
          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.4)'
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)'
          }}
        >
          <IconMail size={24} />
        </ThemeIcon>
      </Box>
    </Box>
  )
}