function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-3 px-6 text-sm text-gray-500 flex items-center justify-between">
      <span>© {new Date().getFullYear()} Stockgo • All rights reserved.</span>
      {/* <span className="font-medium text-gray-700">by </span> */}
    </footer>
  );
}

export default Footer;
