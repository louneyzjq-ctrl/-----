import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Game from './pages/Game'
import Result from './pages/Result'

export default function App() {
  return (
    <div className="spaceWrap">
      <div className="appContent">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:id" element={<Game />} />
            <Route path="/result/:id" element={<Result />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  )
}
