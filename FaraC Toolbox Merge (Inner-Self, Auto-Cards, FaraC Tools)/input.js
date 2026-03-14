// Your "Input" tab should look like this
handleToolboxInput(); 
const modifier = (text) => {
  // Your other input modifier scripts go here
  text = ParagraphFix("input", text);
  // Your other input modifier scripts go here
  return { text };
};
modifier(text);
