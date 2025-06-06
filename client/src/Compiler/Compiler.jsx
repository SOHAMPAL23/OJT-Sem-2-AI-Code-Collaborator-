import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import './Compiler.css';


const Compiler = ({ darkMode, roomId, code, setCode, editorLanguage, editorVersion, setEditorLanguage,setEditorVersion }) => {
  const codeRef = useRef(code);
  const socketRef = useRef(null);
  const [output, setOutput] = React.useState('');
  const [stdin, setStdin] = React.useState('');
  const [language, setLanguage] = React.useState('python');
  const [version, setVersion] = React.useState('3.10.0');

  const languageVersionMap = {
    python: ['3.10.0'],
    javascript: ['18.15.0'],
    cpp: ['10.2.0'],
    java: ['15.0.2'],
  };

  const languageMapForMonaco = {
    python: 'python',
    javascript: 'javascript',
    cpp: 'cpp',
    java: 'java',
  };

  useEffect(() => {
    if (!roomId) return;
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-room', roomId);
    });

    socketRef.current.on('receive-code', (newCode) => {
      if (newCode !== codeRef.current) {
        setCode(newCode);
        codeRef.current = newCode;
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  const handleEditorChange = (value) => {
    setCode(value);
    codeRef.current = value;
    if (socketRef.current && roomId) {
      socketRef.current.emit('code-change', { roomId, code: value });
    }
  };

  const runCode = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/compile', {
        language,
        version,
        code,
        stdin,
      });
      setOutput(res.data.run?.output || res.data.output || 'No output');
    } catch (err) {
      setOutput('Error running code');
    }
  };

  const loadBoilerplate = (lang) => {
    switch (lang) {
      case 'python':
        return `def main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()`;
      case 'javascript':
        return `function main() {\n  console.log("Hello, World!");\n}\n\nmain();`;
      case 'java':
        return `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`;
      case 'cpp':
        return `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`;
      default:
        return '';
    }
  };

  return (
    <div div className={`compiler-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="compiler-header">
      <select
        value={language}
        onChange={(e) => {
          const lang = e.target.value;
          setLanguage(lang);
          setVersion(languageVersionMap[lang][0]);
          const boilerplate = loadBoilerplate(lang);
          setCode(boilerplate);
          codeRef.current = boilerplate;

          if (socketRef.current && roomId?.trim()) {
            socketRef.current.emit('code-change', { roomId, code: boilerplate });
          }
        }}
      >
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
      </select>
      <button onClick={runCode}>Run Code</button>
      <br /><br />

      <MonacoEditor
        height="500px"
        language={languageMapForMonaco[language]}
        theme={darkMode ? 'vs-dark' : 'light'}
        value={code}
        onChange={handleEditorChange}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: 'on',
        }}
        
      />

      <br /><br />
      <textarea
        rows="3"
        cols="80"
        placeholder="Input (stdin)..."
        value={stdin}
        onChange={(e) => setStdin(e.target.value)}
      />
      <br /><br />

      <h3>Output:</h3>
      <div className="compiler-output">
      <pre>{output}</pre>
      </div>
    </div>
    </div>
  );
};

export default Compiler;
