// src/App.jsx
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { Suspense, useRef, useState, useEffect } from "react"
import "./App.css"

// main object import
function HoverableObject({ object, onClick }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    ref.current.traverse((child) => {
      if (child.isMesh && child.material) {
        // save original color once
        if (!child.userData.originalColor) {
          child.userData.originalColor = child.material.color.clone()
        }

        const baseColor = child.userData.originalColor

        if (hovered) {
          // slightly darken when hovered
          child.material.color = baseColor.clone().multiplyScalar(0.7)
        } else {
          // restore original color
          child.material.color = baseColor.clone()
        }
      }
    })
  }, [hovered])

  return (
    <primitive
      object={object}
      ref={ref}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) {
          onClick(object)
        }
      }}
    />
  )
}

function GoldenEgg({ onObjectClick }) {
  const gltf = useLoader(GLTFLoader, "/GoldenEgg.glb")
  const eggRef = useRef()

// object rotation
  useFrame(() => {
    if (eggRef.current) {
      eggRef.current.rotation.y += 0.005
    }
  })

  return (
    <group ref={eggRef} scale={0.03} position={[0, -1, 0]}>
      {gltf.scene.children.map((child, index) => (
        <HoverableObject
          key={index}
          object={child}
          onClick={onObjectClick}
        />
      ))}
    </group>
  )
}

function SimpleOrbitControls() {
  const { camera } = useThree()
  const isDragging = useRef(false)
  const prev = useRef([0, 0])

  useEffect(() => {
    const onMouseDown = (e) => {
      isDragging.current = true
      prev.current = [e.clientX, e.clientY]
    }

    const onMouseMove = (e) => {
      if (!isDragging.current) return

      const [px, py] = prev.current
      const dx = e.clientX - px
      const dy = e.clientY - py
      prev.current = [e.clientX, e.clientY]

      // orbit horizontally (rotate around Y axis)
      camera.rotation.y -= dx * 0.005

      // orbit vertically (rotate around X axis)
      camera.rotation.x -= dy * 0.005
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x))
    }

    const onMouseUp = () => {
      isDragging.current = false
    }

    window.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)

    return () => {
      window.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [camera])

  return null
}

function App() {
  const [selectedObject, setSelectedObject] = useState(null)

  return (
    <>
      <Canvas>
        <ambientLight />
        <directionalLight position={[2, 0, 2]} />
        <Suspense fallback={null}>
          <GoldenEgg onObjectClick={setSelectedObject} />
        </Suspense>
        <SimpleOrbitControls />
      </Canvas>

      {selectedObject && (
        <div className="popup">
          <h2>{selectedObject.name || "Component"}</h2>
          <p>This is a part of the Golden Egg model.</p>
          <button onClick={() => setSelectedObject(null)}>Close</button>
        </div>
      )}
    </>
  )
}

export default App
