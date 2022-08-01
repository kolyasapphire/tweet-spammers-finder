import { useState } from 'react'

import { Text, Button, Textarea, VStack } from '@chakra-ui/react'

import { useLocalStorage } from 'hooks'

const Index = () => {
  const [storedKey, setStoredKey] = useLocalStorage('key', '')
  const [storedCookie, setStoredCookie] = useLocalStorage('cookie', '')
  const [storedBody, setStoredBody] = useLocalStorage('body', '')
  const [storedHash, setStoredHash] = useLocalStorage('hash', '')
  const [storedPageId, setStoredPageId] = useLocalStorage('pageId', '')

  const [key, setKey] = useState(storedKey)
  const [cookie, setCookie] = useState(storedCookie)
  const [body, setBody] = useState(storedBody)
  const [hash, setHash] = useState(storedHash)
  const [pageId, setPageId] = useState(storedPageId)

  const save = () => {
    setStoredKey(key)
    setStoredCookie(cookie)
    setStoredBody(body)
    setStoredHash(hash)
    setStoredPageId(pageId)
  }

  return (
    <VStack spacing={3}>
      <VStack>
        <Text>Key</Text>
        <Textarea value={key} onChange={(x) => setKey(x.target.value)} />
      </VStack>
      <VStack>
        <Text>Cookie</Text>
        <Textarea value={cookie} onChange={(x) => setCookie(x.target.value)} />
      </VStack>
      <VStack>
        <Text>Body</Text>
        <Textarea value={body} onChange={(x) => setBody(x.target.value)} />
      </VStack>
      <VStack>
        <Text>SAPISIDHASH</Text>
        <Textarea value={hash} onChange={(x) => setHash(x.target.value)} />
      </VStack>
      <VStack>
        <Text>Page ID</Text>
        <Textarea value={pageId} onChange={(x) => setPageId(x.target.value)} />
      </VStack>
      <Button onClick={() => save()}>Save</Button>
    </VStack>
  )
}

export default Index
