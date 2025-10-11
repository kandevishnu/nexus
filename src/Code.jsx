import React from "react";

const CodeDisplay = () => {
  const code = `
  // src/pages/AdminDashboard/UploadFile.jsx

  import React, { useState, useRef } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { FileUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';
  import { getCookie } from '../../utils';

  const UploadFile = () => {
      // your component code...
  };

  export default UploadFile;
  `;

  return (
    <pre className="bg-gray-900 text-green-300 p-4 rounded-lg overflow-x-auto text-sm">
      <code>{code}</code>
    </pre>
  );
};

export default CodeDisplay;
