import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { Suspense, useRef, useState, useEffect } from "react"
import "./App.css"

// contents for each popups
const POPUP_CONTENT = {
  web: {
    title: "Outer Shell",
    text: "Morse code for the website URL 'katelyncho.github.io/The-Golden-Egg/'"
  },
  spring: {
    title: "Spring",
    text: "We shall remember our roots; either cultural, generic, personal, or whawtever it may be. We always need a 'home' to stay and come back"
  },
  summer: {
    title: "Summer",
    text: "Human beings are greedy and egotistical. I hate myself because I know I am like that too"
  },
  fall: {
    title: "Fall",
    text: "Humanity is ephemeral, but also so beautiful because it's like a spark of light"
  },
  winter: {
    title: "Winter",
    text: "I have such a big love-hate relationship with humanity. Humans are so disgusting yet so beautiful. I wonder how the next intelligent beings would be like. would they become like us, or different?"
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

      // excluding ball bearing parts from being clickable
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
  }, [camera])

  return null
}

function App() {
  const [selectedObject, setSelectedObject] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")

  // password setting
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
          background: "rgb(38, 31, 46)",
          color: "rgba(223, 164, 54, 1)",
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
            background: "rgb(38, 31, 46)",
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
          <button type="submit" style={{ background: "rgba(223, 164, 54, 1)", color: "rgb(38, 31, 46)" }}>Enter</button>
        </form>
      </div>
    )
  }

  // main page with the 3d object
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

 {/* popup window opening when each components are clicked */}
      {selectedObject &&
        (() => {
          const name = selectedObject.name || "Component"
          const info =
            POPUP_CONTENT[name] || {
              title: name,
              text: "",
            }

          return (
            <div className="popup" style={{ background: "rgb(38, 31, 46)", color: "rgba(223, 164, 54, 1)" }}>
              <h2>{info.title}</h2>
              <p>{info.text}</p>
              <button style={{ background: "rgba(223, 164, 54, 1)", color: "rgb(38, 31, 46)" }} onClick={() => window.location.reload()}>Close</button>
            </div>
          )
        })()}
    </div>
  )
}


export default App