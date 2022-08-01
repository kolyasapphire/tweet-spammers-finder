import { useState } from 'react'
import { VStack, Heading } from '@chakra-ui/react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import Video from './Video'

const Channel = ({ data }) => {
  const [vids, setVids] = useState(data.videos)

  const deleteVidVisually = (id) => setVids(vids.filter((x) => x.id !== id))

  return (
    <VStack>
      <Accordion allowMultiple allowToggle>
        <AccordionItem>
          <AccordionButton>
            <Heading pb={5}>
              {data.name} ({vids.length})
            </Heading>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <VStack spacing={5}>
              {vids.map((x) => (
                <Video
                  key={x.id}
                  data={x}
                  deleteVidVisually={deleteVidVisually}
                />
              ))}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </VStack>
  )
}

export default Channel
