import { useState } from 'react'
import mqtt from 'mqtt'
import { Input, Button, Flex, FormControl } from '@chakra-ui/react'

const TaskInput = () => {
  const [task, setTask] = useState('')
  // const [client] = useState(() => mqtt.connect('ws://broker.hivemq.com:8000/mqtt'))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!task.trim()) return

    const taskData = {
      text: task,
      timestamp: new Date().toISOString()
    }

    client.publish('/add', JSON.stringify(taskData))
    setTask('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex gap={2}>
        <Input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="New Note..."
          size="md"
          borderRadius="md"
          flex="1"
        />
        <Button
          type="submit"
          bg="brand.500"
          color="white"
          _hover={{ bg: 'brown.600' }}
          borderRadius="md"
          px={4}
        >
          Add
        </Button>
      </Flex>
    </form>
  )
}

export default TaskInput