import { useState, useEffect } from 'react'
import axios from 'axios'
import { Box, Container, Heading, Flex } from '@chakra-ui/react'
import mqtt from 'mqtt'
import TaskList from './components/TaskList'
import TaskInput from './components/TaskInput'

function App() {
  const [tasks, setTasks] = useState([])
  const [mqttClient, setMqttClient] = useState(null)

  useEffect(() => {
    fetchTasks()
    
    // Connect to MQTT broker
    const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt')
    setMqttClient(client)
    
    // Subscribe to the topic when a new task is added
    client.on('connect', () => {
      console.log('Connected to MQTT broker')
      client.subscribe('/add')
    })
    
    // Handle incoming messages
    client.on('message', (topic, message) => {
      if (topic === '/add') {
        try {
          const newTask = JSON.parse(message.toString())
          setTasks(prevTasks => [newTask, ...prevTasks])
        } catch (error) {
          console.error('Error parsing MQTT message:', error)
        }
      }
    })
    
    // Clean up the MQTT connection when component unmounts
    return () => {
      if (client) {
        client.end()
      }
    }
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get('https://fullstack-task-rutuj.onrender.com/fetchAllTasks')
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="md">
        <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
          <Flex align="center" mb={4}>
            <Box as="span" mr={2}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#8B4513">
                <rect width="24" height="24" rx="4" fill="#8B4513" opacity="0.2" />
                <rect x="4" y="6" width="16" height="2" rx="1" fill="#8B4513" />
                <rect x="4" y="11" width="16" height="2" rx="1" fill="#8B4513" />
                <rect x="4" y="16" width="16" height="2" rx="1" fill="#8B4513" />
              </svg>
            </Box>
            <Heading size="md" fontWeight="bold">Note App</Heading>
          </Flex>
          <TaskInput />
          <Heading size="sm" mt={6} mb={2}>Notes</Heading>
          <TaskList tasks={tasks} />
        </Box>
      </Container>
    </Box>
  )
}

export default App