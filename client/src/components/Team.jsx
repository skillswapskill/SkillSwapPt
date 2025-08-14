import React from "react";
import { motion } from "framer-motion";
import anubhabImg from "../assets/get.webp";
import sagarImg from "../assets/sagar pic.jpg";
import arizImg from "../assets/ariz pic.jpg";

const founder = {
  name: "Anubhab Chowdhury",
  role: "Founder & CEO",
  image: anubhabImg,
  bio: "Visionary leader of SkillSwap, driving innovation and empowering talents worldwide.",
};

const teamMembers = [
  {
    name: "Ariz",
    role: "Advertiser",
    image: arizImg,
    bio: "Creative strategist shaping SkillSwap’s brand presence with impactful campaigns.",
  },
  {
    name: "Sagar Paul",
    role: "Application Developer",
    image: sagarImg,
    bio: "Tech mastermind crafting seamless experiences for our global users.",
  },
];

export default function Team() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 px-6 py-8 flex flex-col items-center">
        <br></br>
        <br></br>
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-900 mb-1"
      >
        Meet Our <span className="text-purple-600">Team</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-sm text-gray-600 mb-6"
      >
        The brilliant minds making SkillSwap a place where skills spark change.
      </motion.p>

      {/* Founder Row */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-4 w-full max-w-lg flex flex-col items-center border border-purple-200 mb-5"
      >
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={founder.image}
          alt={founder.name}
          className="w-24 h-24 rounded-full border-4 border-purple-500 shadow-md object-cover"
        />
        <h2 className="text-lg font-bold text-gray-800 mt-2">{founder.name}</h2>
        <p className="text-purple-600 text-sm font-medium">{founder.role}</p>
        <p className="mt-1 text-gray-600 text-xs text-center">{founder.bio}</p>
      </motion.div>

      {/* Team Row */}
      <div className="grid grid-cols-2 gap-4 max-w-3xl w-full">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white/60 backdrop-blur-md rounded-lg shadow-md hover:shadow-xl transition p-4 flex flex-col items-center border border-purple-100"
          >
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={member.image}
              alt={member.name}
              className="w-20 h-20 rounded-full border-3 border-purple-400 shadow-md object-cover"
            />
            <h2 className="text-md font-semibold text-gray-800 mt-2">{member.name}</h2>
            <p className="text-purple-500 text-xs font-medium">{member.role}</p>
            <p className="mt-1 text-gray-600 text-xs text-center">{member.bio}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
