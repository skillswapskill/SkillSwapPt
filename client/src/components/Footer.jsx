import React from "react";

const Footer = () => {
  const footerNavs = [
    {
      label: "Company",
      items: [
        { href: "#", name: "Partners" },
        { href: "#", name: "Blog" },
        { href: "#", name: "Team" },
        { href: "/careers", name: "Careers" },
      ],
    },
    {
      label: "Resources",
      items: [
        { href: "#", name: "Contact" },
        { href: "#", name: "Support" },
        { href: "#", name: "Docs" },
        { href: "#", name: "Pricing" },
      ],
    },
    {
      label: "About",
      items: [
        { href: "#", name: "Terms" },
        { href: "#", name: "License" },
        { href: "#", name: "Privacy" },
        { href: "#", name: "About Us" },
      ],
    },
  ];

  const socialIcons = [
    {
      href: "https://www.facebook.com/profile.php?id=61577917421090",
      label: "Facebook",
      path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
      color: "blue-600",
    },
    {
      href: "https://x.com/2025Skills72565",
      label: "Twitter",
      path: "M5 16c6 0 9.3-5 9.3-9.3v-.4A6.7 6.7 0 0016 4.5a6.4 6.4 0 01-1.9.5 3.3 3.3 0 001.4-1.8 6.5 6.5 0 01-2.1.8 3.3 3.3 0 00-5.6 3c-2.8-.1-5.3-1.4-7-3.4A3.3 3.3 0 002 7.7a3.3 3.3 0 001.5-.4v.1a3.3 3.3 0 002.6 3.2A3.4 3.4 0 013 10v.1a3.3 3.3 0 002.6 3.2 6.7 6.7 0 01-4.2 1.5A6.6 6.6 0 015 16",
      color: "blue-400",
    },
    {
      href: "https://www.linkedin.com/in/skill-swap-434622373/",
      label: "LinkedIn",
      path: "M16 8a6 6 0 016 6v6h-4v-6a2 2 0 00-4 0v6h-4v-6a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 012 2v0a2 2 0 01-4 0v0a2 2 0 012-2z",
      color: "blue-700",
    },
    {
      href: "#",
      label: "YouTube",
      path: "M10 15l5.2-3-5.2-3v6zm9-9c.6 0 1 .4 1 1v10c0 .6-.4 1-1 1H1c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h18z",
      color: "red-600",
    },
    {
      href: "https://www.instagram.com/skillswap_2025/",
      label: "Instagram",
      path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .3 2.4.5.6.2 1 .5 1.4 1 .4.4.7.9 1 1.4.2.4.4 1.2.5 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 2-.5 2.4a3.8 3.8 0 01-1 1.4 3.8 3.8 0 01-1.4 1c-.4.2-1.2.4-2.4.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.3-2.4-.5a3.8 3.8 0 01-1.4-1 3.8 3.8 0 01-1-1.4c-.2-.4-.4-1.2-.5-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-2 .5-2.4.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-1 .4-.2 1.2-.4 2.4-.5C8.4 2.2 8.8 2.2 12 2.2zm0 2.4c-3.1 0-3.5 0-4.8.1-1 .1-1.6.3-2 .4-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.4-.3 1-.4 2-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1 .3 1.6.4 2 .2.5.4.8.7 1.1.3.3.6.5 1.1.7.4.1 1 .3 2 .4 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1-.1 1.6-.3 2-.4.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.4.3-1 .4-2 .1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1-.3-1.6-.4-2-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.4-.1-1-.3-2-.4-1.3-.1-1.7-.1-4.8-.1zm0 3.4a6.4 6.4 0 110 12.8 6.4 6.4 0 010-12.8zm0 2.4a4 4 0 100 8 4 4 0 000-8zm5.2-1.8a1.4 1.4 0 110 2.8 1.4 1.4 0 010-2.8z",
      color: "pink-500",
    },
  ];

  return (
    <footer className="text-gray-500 bg-white px-4 py-5 max-w-screen-xl mx-auto md:px-8">
      <div className="gap-6 justify-between md:flex">
        <div className="flex-1">
          <div className="max-w-xs">
            <img src="/skillSwap.ico" className="w-15 h-15" alt="Logo" />
            <p className="leading-relaxed mt-2 text-[15px]">
              Reset the primitive approach of learning Skills
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <label className="block pt-4 pb-2">Stay up to date</label>
            <div className="max-w-sm flex items-center border rounded-md p-1">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-2.5 outline-none"
              />
              <button className="p-2.5 rounded-md text-white bg-indigo-600 outline-none shadow-md focus:shadow-none sm:px-5">
                Subscribe
              </button>
            </div>
          </form>
        </div>

        <div className="flex-1 mt-10 space-y-6 items-center justify-between sm:flex md:space-y-0 md:mt-0">
          {footerNavs.map((item, idx) => (
            <ul className="space-y-4" key={idx}>
              <h4 className="text-gray-800 font-medium">{item.label}</h4>
              {item.items.map((el, idy) => (
                <li key={idy}>
                  <a
                    href={el.href}
                    className="hover:underline hover:text-indigo-600"
                  >
                    {el.name}
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="mt-8 py-6 border-t items-center justify-between sm:flex">
        <div className="mt-4 sm:mt-0">
          &copy; 2025 SkillSwap All rights reserved.
        </div>
        <div className="mt-6 sm:mt-0">
          <ul className="flex items-center space-x-4">
            {socialIcons.map((icon, index) => (
              <li
                key={index}
                className="w-10 h-10 border rounded-full flex items-center justify-center"
              >
                <a href={icon.href} aria-label={icon.label}target="_blank">
                  <svg
                    className={`w-5 h-5 text-${icon.color}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={icon.path} />
                  </svg>
                  
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
