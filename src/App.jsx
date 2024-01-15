import { useState } from 'react'
import './App.css'
import Calender from './components/Calender'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Calender/>
    </>
  )
}

export default App
