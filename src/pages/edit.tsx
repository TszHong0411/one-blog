import { Button, Flex, TextInput, Title } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { createStyles } from '@mantine/styles'
import { IconX } from '@tabler/icons'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import React from 'react'

import { createHandler } from '@/lib/handler'
import { sanitize } from '@/lib/sanitize'

import ErrorText from '@/components/ErrorText'
import Layout from '@/components/Layout'
import Loader from '@/components/Loader'
import RichTextEditor, { useEditor } from '@/components/RichTextEditor'

const useStyles = createStyles((theme) => ({
  container: {
    maxWidth: 800,
    width: '100%',
    padding: `0 ${theme.spacing.xl}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
  },
}))

const EditPage = () => {
  const { classes } = useStyles()
  const [title, setTitle] = React.useState('')
  const { status } = useSession()
  const { push } = useRouter()
  const [disabled, setDisabled] = React.useState(false)

  const editor = useEditor({
    options: {
      content: '',
    },
  })

  if (status === 'loading') {
    return <Loader />
  }

  if (status === 'unauthenticated') {
    return <ErrorText />
  }

  const action = (type: 'publish' | 'save') => {
    if (!title || editor.storage.characterCount.words() === 0) {
      return showNotification({
        message: 'Title or content missing',
        icon: <IconX />,
      })
    }

    if (type === 'publish') {
      setDisabled(true)

      createHandler({
        body: {
          title,
          content: sanitize({
            dirty: editor.getHTML(),
          }),
          published: true,
        },
        callback: async (data) => {
          const id = (await data).id
          if (id) {
            push(`/post/${id}`)
          }
        },
      })
    }

    if (type === 'save') {
      setDisabled(true)

      createHandler({
        body: {
          title,
          content: sanitize({
            dirty: editor.getHTML(),
          }),
          published: false,
        },
        callback: () => push('/drafts'),
      })
    }
  }

  return (
    <Layout
      seo={{
        title: 'Edit',
      }}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Title align='center' mb={40}>
        New post
      </Title>
      <Flex justify='center' align='center' w='100%'>
        <div className={classes.container}>
          <TextInput
            withAsterisk
            size='lg'
            label='Title'
            w='100%'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <RichTextEditor editor={editor} />
          <Flex justify='space-between'>
            <Flex gap={8}>
              <Button
                type='button'
                onClick={() => action('save')}
                disabled={disabled}
              >
                Save as draft
              </Button>
              <Button
                type='button'
                onClick={() => action('publish')}
                disabled={disabled}
              >
                Publish
              </Button>
            </Flex>
            <Button variant='outline' type='button' onClick={() => push('/')}>
              Cancel
            </Button>
          </Flex>
        </div>
      </Flex>
    </Layout>
  )
}

export default EditPage
