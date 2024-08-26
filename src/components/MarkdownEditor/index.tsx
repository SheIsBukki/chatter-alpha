import { useState } from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import rehypeSanitize from "node_modules/rehype-sanitize/lib";

//
const MarkdownEditor: React.FC = () => {
  const [value, setValue] = useState("**Hello world!!!**");

  return (
    <div className="container">
      <MDEditor
        aria-describedby="markdown-error"
        value={value}
        height={500}
        visiableDragbar={false}
        onChange={(val) => setValue(val ?? "")}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
        textareaProps={{
          placeholder: "Start writing in markdown...",
        }}
        aria-placeholder="Start writing in markdown..."
        commands={[
          commands.bold,
          commands.italic,
          commands.link,
          commands.strikethrough,
          commands.codePreview,
          commands.fullscreen,
          commands.divider,
          commands.code,
          commands.codeBlock,
          commands.codeEdit,
          commands.hr,
          commands.image,
          commands.quote,
          commands.orderedListCommand,
          commands.unorderedListCommand,
          commands.strikethrough,
        ]}
      />
    </div>
  );
};

export default MarkdownEditor;
