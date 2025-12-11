import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { Suspense, useRef, useState, useEffect } from "react"
import "./App.css"

// contents for each popups
const POPUP_CONTENT = {
  web: {
    title: "Outer Shell",
    text: "This is the protective outer layer of the Golden Egg."
  },
  spring: {
    title: "Spring",
    text: "The bright center of the egg, symbolizing creativity and ideas."
  },
  summer: {
    title: "Summer",
    text: "Layer 1 represents the first stage of exploration."
  },
  fall: {
    title: "Fall",
    text: "Layer 2 goes deeper into the Golden Egg’s structure."
  },
  winter: {
    title: "Winter",
    text: "Layer 2 goes deeper into the Golden Egg’s structure."
  }
}


// main object import
function HoverableObject({ object, onClick }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    ref.current.traverse((child) => {
      if (child.isMesh && child.material) {
        if (!child.userData.originalColor) {
          child.userData.originalColor = child.material.color.clone()
        }

        const baseColor = child.userData.originalColor

        if (hovered) {
          // slightly darken when hovered
          child.material.color = baseColor.clone().multiplyScalar(0.7)
        } else {
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
    <group ref={eggRef} scale={0.03} position={[0, -0.5, 0]}>
      {gltf.scene.children.map((child, index) => {
      const name = child.name?.toLowerCase()

      // setting ball bearings not clickable
      if (name === "ball_bearing") {
        return (
          <primitive
            key={index}
            object={child}
          />
        )
      }

      // making all components in the glb file clickable
      return (
        <HoverableObject
          key={index}
          object={child}
          onClick={onObjectClick}
        />
      )
    })}

    </group>
  )
}

// making user rotate around the scene
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

      camera.rotation.y -= dx * 0.005
      camera.rotation.x -= dy * 0.005
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x))
    }

    // const onMouseUp = () => {
    //   isDragging.current = false
    // }

    // window.addEventListener("mousedown", onMouseDown)
    // window.addEventListener("mousemove", onMouseMove)
    // window.addEventListener("mouseup", onMouseUp)

    // return () => {
    //   window.removeEventListener("mousedown", onMouseDown)
    //   window.removeEventListener("mousemove", onMouseMove)
    //   window.removeEventListener("mouseup", onMouseUp)
    // }
  }, [camera])

  return null
}

function App() {
  const [selectedObject, setSelectedObject] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")

  const CORRECT_PASSWORD = "goldenegg"

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      setAuthenticated(true)
    } else {
      alert("Wrong password")
    }
  }

  // password page
  if (!authenticated) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "black",
          color: "white",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "20px",
            borderRadius: "10px",
            background: "rgba(0, 0, 0, 0.8)",
          }}
        >
          <label>
            Enter password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginLeft: "8px" }}
            />
          </label>
          <button type="submit">Enter</button>
        </form>
      </div>
    )
  }

  // show the main page when password is correct
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas style={{ width: "100%", height: "100%" }}>
        <ambientLight />
        <directionalLight position={[2, 0, 2]} />
        <Suspense fallback={null}>
          <GoldenEgg onObjectClick={setSelectedObject} />
        </Suspense>
        <SimpleOrbitControls />
      </Canvas>

      {selectedObject &&
        (() => {
          const name = selectedObject.name || "Component"
          const info =
            POPUP_CONTENT[name] || {
              title: name,
              text: "",
            }

          return (
            <div className="popup">
              <h2>{info.title}</h2>
              <p>{info.text}</p>
              <button onClick={() => window.location.reload()}>Close</button>
            </div>
          )
        })()}
    </div>
  )
}


export default App