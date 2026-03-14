// Your "Context" tab should look like this
handleToolboxContext(); 
const modifier = (text) => {
  text = insertFloatingPrompt(text);
  // Your other context modifier scripts go here
  text = ParagraphFix("context", text);
  // Your other context modifier scripts go here
  return { text, stop }; 
};
modifier(text);
