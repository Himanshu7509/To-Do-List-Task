import React, { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import sideimg from "../welcome/lap.png";

const WelcomePage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerInfo, setRegisterInfo] = useState({
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/home");
      }
    });
  }, [navigate]);

  const handleSignIn = () => {
    if (!email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigate("/home"))
      .catch((err) => setErrorMessage(err.message));
  };

  const handleRegister = () => {
    if (!registerInfo.email || !registerInfo.confirmEmail || !registerInfo.password || !registerInfo.confirmPassword) {
      setErrorMessage("Please fill in all fields.");
    } else if (registerInfo.email !== registerInfo.confirmEmail) {
      setErrorMessage("Emails do not match.");
    } else if (registerInfo.password !== registerInfo.confirmPassword) {
      setErrorMessage("Passwords do not match.");
    } else {
      createUserWithEmailAndPassword(auth, registerInfo.email, registerInfo.password)
        .then(() => navigate("/home"))
        .catch((err) => setErrorMessage(err.message));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Heading */}
      <h1 className="text-red-500 font-bold text-3xl sm:text-4xl text-center mt-10">
        To-Do List
      </h1>

      {/* Content Section */}
      <div className="flex flex-col lg:flex-row flex-1 w-full px-4 sm:px-8 lg:px-16">
        {/* Left Section - Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-2 lg:p-6 bg-white ">
          <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-center text-black mb-6">
              {registering ? "Register" : "Sign In"}
            </h1>

            {registering ? (
              <div className="space-y-4">
                <input
                  value={registerInfo.email}
                  onChange={(e) =>
                    setRegisterInfo({ ...registerInfo, email: e.target.value })
                  }
                  type="email"
                  className="border-2 w-full px-4 py-2 rounded-lg shadow-sm"
                  placeholder="Enter your Email"
                />
                <input
                  value={registerInfo.confirmEmail}
                  onChange={(e) =>
                    setRegisterInfo({ ...registerInfo, confirmEmail: e.target.value })
                  }
                  type="email"
                  className="border-2 w-full px-4 py-2 rounded-lg shadow-sm"
                  placeholder="Confirm Email"
                />
                <div className="relative">
                  <input
                    value={registerInfo.password}
                    onChange={(e) =>
                      setRegisterInfo({ ...registerInfo, password: e.target.value })
                    }
                    type={showRegisterPassword ? "text" : "password"}
                    className="border-2 w-full px-4 py-2 rounded-lg shadow-sm"
                    placeholder="Enter your Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-black"
                  >
                    {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    value={registerInfo.confirmPassword}
                    onChange={(e) =>
                      setRegisterInfo({
                        ...registerInfo,
                        confirmPassword: e.target.value,
                      })
                    }
                    type={showConfirmPassword ? "text" : "password"}
                    className="border-2 w-full px-4 py-2 rounded-lg shadow-sm"
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-black"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errorMessage && (
                  <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                )}
                <button
                  onClick={handleRegister}
                  className="w-full py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Register
                </button>
                <button
                  onClick={() => {
                    setRegistering(false);
                    setErrorMessage("");
                  }}
                  className="w-full py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="border-2 w-full px-4 py-2 rounded-lg shadow-sm"
                  placeholder="Enter your Email"
                />
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    className="border-2 w-full px-4 py-2 rounded-lg shadow-sm"
                    placeholder="Enter your Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-black"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errorMessage && (
                  <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                )}
                <button
                  onClick={handleSignIn}
                  className="w-full py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setRegistering(true);
                    setErrorMessage("");
                  }}
                  className="w-full py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Create an Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Image */}
        <div className="flex-1 flex justify-center items-center bg-white">
          <img
            src={sideimg}
            alt="Welcome Illustration"
            className="w-full max-w-[90%] lg:max-w-lg object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
