"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Correct import for App Router
import { motion, useAnimation } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Proposal } from "@/types";

const PROPOSAL_QUOTES = [
    "Will you make me the happiest person alive?",
    "You stole my heart, can I keep yours?",
    "I'm not a photographer, but I can picture us together.",
    "Are you a magician? Because whenever I look at you, everyone else disappears.",
    "Do you have a map? I keep getting lost in your eyes.",
    "My heart beats faster when you are around.",
];

export default function ProposalPage() {
    const params = useParams();
    const id = params?.id as string;

    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState(true);
    const [accepted, setAccepted] = useState(false);
    const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
    const [noButtonSize, setNoButtonSize] = useState(1);
    const [quote, setQuote] = useState("");

    const noControls = useAnimation();

    useEffect(() => {
        setQuote(PROPOSAL_QUOTES[Math.floor(Math.random() * PROPOSAL_QUOTES.length)]);

        const fetchProposal = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "proposals", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProposal(docSnap.data() as Proposal);
                } else {
                    // Handle Not Found
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching proposal:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProposal();
    }, [id]);

    const handleYes = async () => {
        setAccepted(true);
        triggerConfetti();

        if (id) {
            try {
                const { updateDoc } = await import("firebase/firestore");
                const docRef = doc(db, "proposals", id);
                await updateDoc(docRef, {
                    accepted: true,
                    acceptedAt: Date.now()
                });
            } catch (error) {
                console.error("Error updating proposal:", error);
            }
        }
    };

    const handleNoHover = () => {
        // Random position movement
        const x = (Math.random() - 0.5) * 200; // -100 to 100
        const y = (Math.random() - 0.5) * 200; // -100 to 100
        setNoButtonPosition({ x, y });
        setNoButtonSize((prev) => Math.max(0.5, prev - 0.1)); // Shrink button
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ["#ff69b4", "#ff1493", "#ffb6c1"],
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ["#ff69b4", "#ff1493", "#ffb6c1"],
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-pink-500 w-10 h-10" />
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-pink-200">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700">Proposal Not Found</h2>
                    <p className="text-gray-500 mt-2">This link might be invalid or expired.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4 overflow-hidden relative">
            {/* Background Hearts */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, i) => (
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
                        <Heart size={Math.random() * 40 + 20} fill="currentColor" />
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg w-full bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 z-10 border border-pink-100 text-center"
            >
                {!accepted ? (
                    <>
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="inline-block mb-6"
                        >
                            <Heart className="w-20 h-20 text-red-500 fill-current drop-shadow-lg" />
                        </motion.div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-serif leading-tight">
                            {quote}
                        </h1>

                        <p className="text-xl text-gray-600 mb-12">
                            Will you be my Valentine?
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative h-32">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleYes}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-12 rounded-full shadow-lg text-xl z-20"
                            >
                                YES ❤️
                            </motion.button>

                            <motion.button
                                animate={{ x: noButtonPosition.x, y: noButtonPosition.y, scale: noButtonSize }}
                                onMouseEnter={handleNoHover}
                                onClick={handleNoHover} // Handle click for touch devices
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-4 px-12 rounded-full shadow-lg text-xl transition-colors duration-200"
                            >
                                NO 😢
                            </motion.button>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                        >
                            <Heart className="w-24 h-24 text-red-500 mx-auto fill-current" />
                        </motion.div>

                        <h2 className="text-4xl font-bold text-gray-800 font-serif">Yay! I knew it! ❤️</h2>

                        <div className="bg-pink-100 p-6 rounded-2xl border border-pink-200 mt-8 transform rotate-1">
                            <p className="text-sm uppercase tracking-wide text-pink-500 font-bold mb-2">Message from {proposal.senderName}:</p>
                            <p className="text-2xl text-gray-800 font-handwriting italic leading-relaxed">
                                "{proposal.message || "I can't wait to celebrate with you!"}"
                            </p>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
