import { useState, useEffect } from 'react'
import mqtt from 'mqtt'
import { Input, Button, Flex } from '@chakra-ui/react'

const TaskInput = () => {
  const [task, setTask] = useState('')
  const [client, setClient] = useState(null)
  
  useEffect(() => {
   
    const mqttClient = mqtt.connect('ws://broker.hivemq.com:8000/mqtt')
    setClient(mqttClient)

    return () => {
      if (mqttClient) {
        mqttClient.end()
      }
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!task.trim() || !client) return

    const taskData = {
      text: task,
      timestamp: new Date().toISOString()
    }

    if (client.connected) {
      client.publish('/add', JSON.stringify(taskData))
      console.log('Task published:', taskData)
      setTask('')
    } else {
      console.error('MQTT client not connected')
    }
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