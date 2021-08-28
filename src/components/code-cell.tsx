import { useState } from 'react';
import CodeEditor from './code-editor';
import Preview from './preview';
import bundler from '../bundler/index';

const CodeCell = () => {
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');

  const onClick = async () => {
    const output = await bundler(input);
    setCode(output);
  };

  return (
    <div>
      <CodeEditor
        initialValue="const a = 1"
        onChange={(value: string) => setInput(value)}
      />
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <Preview code={code} />
    </div>
  );
};

export default CodeCell