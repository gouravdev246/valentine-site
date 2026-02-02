"use client";

import { useState, useEffect } from "react";
import { Heart, Send, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, onSnapshot } from "firebase/firestore";

export default function Home() {
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<{ accepted?: boolean }>({});

  useEffect(() => {
    const savedLink = localStorage.getItem("valentine_link");
    const savedId = localStorage.getItem("valentine_id");
    if (savedLink && savedId) {
      setGeneratedLink(savedLink);
      listenToProposal(savedId);
    }
  }, []);

  // Listen to the document when link is generated
  const listenToProposal = (docId: string) => {
    const unsub = onSnapshot(doc(db, "proposals", docId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProposalStatus(data);
        if (data.accepted) {
          import("canvas-confetti").then((confetti) => {
            confetti.default({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 }
            });
          });
        }
      }
    });
  };

  useEffect(() => {
    const savedLink = localStorage.getItem("valentine_link");
    const savedId = localStorage.getItem("valentine_id");
    if (savedLink && savedId) {
      setGeneratedLink(savedLink);
      listenToProposal(savedId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) return;

    setLoading(true);
    console.log("Attempting to add document to 'proposals' collection...");

    try {
      // Direct call without timeout for debugging
      const docRef = await addDoc(collection(db, "proposals"), {
        senderName,
        message,
        createdAt: Date.now(),
      });

      console.log("Document written with ID: ", docRef.id);
      const url = `${window.location.origin}/v/${docRef.id}`;
      setGeneratedLink(url);
      localStorage.setItem("valentine_link", url);
      localStorage.setItem("valentine_id", docRef.id);
      listenToProposal(docRef.id);
    } catch (error: any) {
      console.error("Error adding document DETAILS:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      let errorMsg = "Something went wrong! Please try again.";
      if (error.code === 'unavailable') {
        errorMsg = "Network error: Could not connect to Firebase. Check your internet.";
      } else if (error.code === 'permission-denied') {
        errorMsg = "Permission denied: Check Firestore Security Rules.";
      }

      alert(`Error: ${errorMsg}\n\nCheck Console (F12) for details.`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Hearts */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-200"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
              scale: Math.random() * 0.5 + 0.5,
              opacity: 0.3,
            }}
            animate={{
              y: [null, Math.random() * -100],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Heart size={Math.random() * 50 + 20} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 z-10 border border-pink-100"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">Be My Valentine?</h1>
          <p className="text-gray-600">Create a special digital proposal for your loved one.</p>
        </div>

        {!generatedLink ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/50"
                placeholder="Romeo"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Your Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-white/50 min-h-[100px] resize-none"
                placeholder="Will you make me the happiest person..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Creating Magic..."
              ) : (
                <>
                  Create Proposal <Send size={20} />
                </>
              )}
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
              Your link is ready! 💌
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-2 overflow-hidden">
              <input
                readOnly
                value={generatedLink}
                className="bg-transparent w-full outline-none text-gray-600 text-sm"
              />
            </div>

            <button
              onClick={copyToClipboard}
              className={`w-full font-bold py-4 rounded-xl shadow-lg transform transition-all flex items-center justify-center gap-2 ${copied
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
                }`}
            >
              {copied ? (
                <>
                  Copied! <Check size={20} />
                </>
              ) : (
                <>
                  Copy Link <Copy size={20} />
                </>
              )}
            </button>

            <button
              onClick={() => setGeneratedLink("")}
              className="text-gray-500 hover:text-gray-700 underline text-sm"
            >
              Create Another One
            </button>
          </motion.div>
        )}

        {/* Real-time Status Update */}
        {generatedLink && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            {proposalStatus.accepted ? (
              <div className="bg-pink-100 text-pink-600 p-4 rounded-xl border border-pink-200 animate-pulse">
                <p className="text-xl font-bold">🎉 THEY SAID YES! 🎉</p>
                <p className="text-sm">Get ready to celebrate!</p>
              </div>
            ) : (
              <div className="text-gray-500 text-sm flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                Waiting for them to open it...
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
