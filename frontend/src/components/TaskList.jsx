import React from 'react'
import { Box, VStack, Text, Divider, Center } from '@chakra-ui/react'

const TaskList = ({ tasks }) => {
  return (
    <Box mt={2}>
      <VStack spacing={0} align="stretch" borderWidth="1px" borderRadius="md" overflow="hidden">
        {tasks.map((task, index) => (
          <React.Fragment key={index}>
            <Box p={3} _hover={{ bg: 'gray.50' }}>
              <Text color="gray.700">{task.text}</Text>
            </Box>
            {index < tasks.length - 1 && <Divider borderColor="gray.200" />}
          </React.Fragment>
        ))}
      </VStack>
      {tasks.length === 0 && (
        <Center mt={4}>
          <Text color="gray.500">
            No notes yet. Add a new note to get started!
          </Text>
        </Center>
      )}
    </Box>
  )
}

export default TaskList