import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const useNavigate = () => (path) => {
  console.log(`Navigating to ${path}`);
};

const useAuth = () => ({
  setAuth: (auth) => console.log("Setting auth:", auth),
});


const NexusLogo = (props) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <motion.path
      d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
    <motion.path
      d="M2 7L12 12L22 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
    />
    <motion.path
      d="M12 22V12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
    />
  </svg>
);

const MailIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LockIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const LoaderIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const AlertTriangleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const ArrowRightIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <motion.div
      className="fixed top-5 right-5 bg-red-100/80 backdrop-blur-md border border-red-300 text-red-800 p-4 rounded-xl shadow-lg flex items-center z-50"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{
        opacity: 0,
        x: 100,
        transition: { duration: 0.3, ease: "easeIn" },
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <AlertTriangleIcon className="h-6 w-6 mr-3 text-red-600" />
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-2xl font-light text-red-500 hover:text-red-800 transition-colors"
      >
        &times;
      </button>
    </motion.div>
  );
};

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let shapes = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initShapes();
    };

    class Shape {
      constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = Math.random() * 20 + 10;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.3 + 0.1;
        this.fadeSpeed = 0.005;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(165, 180, 252, ${this.opacity})`; 
        ctx.lineWidth = 1.5;

        if (this.type === "triangle") {
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size, this.size);
          ctx.lineTo(-this.size, this.size);
          ctx.closePath();
        } else if (this.type === "square") {
          ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        }
        ctx.stroke();
        ctx.restore();
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.rotationSpeed;

        if (
          this.x < -this.size ||
          this.x > canvas.width + this.size ||
          this.y < -this.size ||
          this.y > canvas.height + this.size
        ) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.opacity = 0;
        }

        if (this.opacity < this.maxOpacity) {
          this.opacity += this.fadeSpeed;
        }

        this.draw();
      }
    }

    function initShapes() {
      shapes = [];
      const shapeTypes = ["triangle", "square", "circle"];
      const numberOfShapes = Math.floor((canvas.width * canvas.height) / 25000);
      for (let i = 0; i < numberOfShapes; i++) {
        shapes.push(
          new Shape(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            shapeTypes[Math.floor(Math.random() * shapeTypes.length)]
          )
        );
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      shapes.forEach((shape) => shape.update());
      animationFrameId = requestAnimationFrame(animate);
    }

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (email.startsWith("o190") && password === "password") {
      setAuth({ email, role: "student" });
      navigate("/dashboard");
      setEmail("");
      setPassword("");
    } else {
      setError("Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3 { font-family: 'Lexend', sans-serif; }
      `}</style>

      <AnimatePresence>
        {error && (
          <ErrorMessage message={error} onClose={() => setError(null)} />
        )}
      </AnimatePresence>

      <div className="min-h-[100dvh] w-full bg-slate-50 text-gray-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 z-0"></canvas>

        <motion.header
          className="flex flex-col items-center text-center mb-8 z-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <NexusLogo className="text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800 mt-2">
            RGUKT-Ongole Nexus
          </h1>
        </motion.header>

        <main className="w-full max-w-4xl lg:grid lg:grid-cols-2 rounded-2xl shadow-2xl shadow-indigo-500/10 z-10 overflow-hidden border border-gray-200/50">
          <div
            className="relative hidden lg:flex flex-col justify-between p-10 bg-cover bg-center h-[500px] rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backgroundImage:
                "url('https://th.bing.com/th/id/R.2a59207f5b6fbfeabf668080312c2b7f?rik=1Jgd9nHJ0DZnAw&riu=http%3a%2f%2fwww.rguktong.ac.in%2fsvgs%2fcarosel%2fssn.png&ehk=5LxgGSQxG%2f8OtufR7ChfFWFpJNU6AfbNPijrH5jlDus%3d&risl=&pid=ImgRaw&r=0')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/80 via-indigo-800/60 to-indigo-900/90"></div>

            <motion.div
              className="relative z-10 flex flex-col h-full text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="font-bold text-2xl text-indigo-200 mb-6 mt-16 drop-shadow-md">
                The Portal to Your Academic Excellence
              </p>

              <div className="flex-grow"></div>

              <div className="border-l-4 border-indigo-400 pl-4">
                <p className="italic text-lg leading-relaxed">
                  "Empowering the next generation of tech leaders from the heart
                  of Andhra Pradesh."
                </p>
                <p className="mt-3 text-indigo-300 text-sm">
                  — Vision Statement
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-center w-full p-8 sm:p-12 bg-white/60 backdrop-blur-xl">
            <motion.div
              className="w-full max-w-md"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h2
                variants={itemVariants}
                className="text-4xl font-bold text-gray-900 mb-2"
              >
                Sign In
              </motion.h2>
              <motion.p variants={itemVariants} className="text-gray-600 mb-8">
                Welcome back to the Nexus Portal.
              </motion.p>

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants} className="relative group">
                  <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <MailIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-300 rounded-lg outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="University Mail ID"
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="relative group">
                  <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <LockIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-300 rounded-lg outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Password"
                  />
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-end text-sm"
                >
                  <a
                    href="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Forgot password?
                  </a>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center disabled:bg-indigo-400 disabled-cursor-not-allowed group"
                    whileHover={{
                      scale: 1.03,
                      transition: { type: "spring", stiffness: 300 },
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <LoaderIcon className="mr-2 h-5 w-5" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRightIcon className="h-5 w-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.form>

              <motion.div
                variants={itemVariants}
                className="mt-8 text-center text-sm text-gray-500"
              >
                <p>
                  &copy; {new Date().getFullYear()} RGUKT-Ongole Nexus. All
                  Rights Reserved.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}
