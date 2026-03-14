```js
// Your "Output" tab should look like this
handleToolboxOutput(); 
const modifier = (text) => {
  // Your other output modifier scripts go here
  text = ParagraphFix("output", text);
  // Your other output modifier scripts go here
  return { text };
};
modifier(text);
