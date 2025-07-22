# Paragraph-Fix
Made by Eliterose 🌹
## Overview
The Paragraph Fix is an AI Dungeon scenario script that automatically configures text into a more consistent and readable format.
## Main Features
- Fully toggleable
- 3 available paragraph formatting types:
  1. Basic formatting (converts multiple spaces/newlines to double newlines)
  2. Empty line dialogue formatting (adds spacing before quotes except after commas)
  3. Newline dialogue formatting (basic + newlines before quotes)
- Indentation (Adds 4-space indents to new paragraphs)
- Complex edge-case handling to keep formatting consistent even with strange AI output.
# Scenario Script Installation Guide
1. Use the AI Dungeon website on PC (or view as desktop if mobile-only)
2. Create a new scenario or edit one of your existing scenarios
3. Open the DETAILS tab at the top while editing your scenario
4. Scroll to the bottom and select EDIT SCRIPTS
5. Select the Input tab on the left
6. Delete all code within said tab
7. Copy and paste the following code into your empty Input tab:
```
// Paragraph Fix Script (Eliterose's version)
// Uses Bin's Paragraph Fix formatting options and LewdLeah's suggestions
function ParagraphFix(hook, inputText) {
    "use strict";
    
    // Default settings
    const DEFAULT_FORMATTING_TYPE = "none"; // "none", "basic", "empty-line", "newline"
    const DEFAULT_INDENT_PARAGRAPHS = false;
    
    // Initialize or retrieve state
    const PF = (function() {
        if (state.ParagraphFix) {
            const pf = state.ParagraphFix;
            delete state.ParagraphFix;
            return pf;
        }
        return {
            formattingType: DEFAULT_FORMATTING_TYPE,
            indentParagraphs: DEFAULT_INDENT_PARAGRAPHS
        };
    })();
    
    // Helper functions
    function readPastAction(lookBack = 0) {
        if (!Array.isArray(history) || history.length === 0) {
            return { text: "", type: "unknown" };
        }
        const index = Math.max(0, history.length - 1 - Math.abs(lookBack));
        const action = history[index] || {};
        return {
            text: action.text || action.rawText || "",
            type: action.type || "unknown"
        };
    }
    
    function adjustNewlines(text) {
        if (PF.formattingType === "none") {
            return text;
        }

        const previousAction = readPastAction(0);
        
        // Look at history[history.length - 1].type, if equal to "do", "say", or "see", then don't proceed
        if (["do", "say", "see"].includes(previousAction.type)) {
            return text;
        }
        
        // Count newlines at end of previous action's text (0, 1, or 2 max)
        const prevText = previousAction.text || "";
        const endNewlines = Math.min(2, (prevText.match(/\n*$/)?.[0] || "").length);
        
        // Count newlines at start of current text (0, 1, or 2 max)
        const startNewlines = Math.min(2, (text.match(/^\n*/)?.[0] || "").length);
        
        // Sum the two newline counts together
        const totalNewlines = endNewlines + startNewlines;
        
        // If the sum is less than 2, then proceed
        if (totalNewlines < 2) {
            if (totalNewlines === 0) {
                // If sum is 0, add nothing
                return text;
            } else if (totalNewlines === 1) {
                // If sum is 1, add "\n" and break
                return "\n" + text;
            }
        }
        
        return text;
    }
    
    function getConfigCardTemplate() {
        return {
            type: "class",
            title: "Configure Paragraph Fix",
            keys: "Edit the entry above to configure the Paragraph Fix",
            entry: "> The Paragraph Fix ensures consistent spacing in your adventure. You may configure the following settings by replacing the current values with your desired options.\n" +
                   "> Formatting Type: " + PF.formattingType + "\n" +
                   "> Indent Paragraphs: " + PF.indentParagraphs + "\n\n" +
                   "> Available formatting types:\n" +
                   "> - none: No formatting applied\n" +
                   "> - basic: Basic formatting (converts multiple spaces/newlines to double newlines)\n" +
                   "> - empty-line: Empty line dialogue formatting (adds spacing before quotes except after commas)\n" +
                   "> - newline: Newline dialogue formatting (basic + newlines before quotes)\n\n" +
                   "> Indent Paragraphs adds 4-space indents to new paragraphs",
            description: "The Paragraph Fix automatically applies consistent spacing and dialogue formatting to your story output. Set formatting type to 'none' to disable all formatting, and set indent paragraphs to 'true' or 'false' to control paragraph indentation."
        };
    }
    
    function extractSettings(text) {
        const settings = {};
        const lines = text.toLowerCase().replace(/[^a-z0-9:\->]+/g, "").split(">");
        
        for (const line of lines) {
            const parts = line.split(":");
            if (parts.length !== 2) continue;
            
            const key = parts[0].trim();
            const value = parts[1].trim();
            
            if (key.includes("formatting") && key.includes("type")) {
                const validTypes = ["none", "basic", "empty-line", "emptyline", "newline"];
                if (validTypes.includes(value)) {
                    settings.formattingType = value.replace("emptyline", "empty-line");
                }
            }
            
            if (key.includes("indent") && key.includes("paragraphs")) {
                const trueValues = ["true", "t", "yes", "y", "on"];
                const falseValues = ["false", "f", "no", "n", "off"];
                if (trueValues.includes(value)) {
                    settings.indentParagraphs = true;
                } else if (falseValues.includes(value)) {
                    settings.indentParagraphs = false;
                }
            }
        }
        
        return settings;
    }
    
    function findConfigCard() {
        const template = getConfigCardTemplate();
        for (const card of storyCards) {
            // Check for exact title match
            if (card.title === template.title) {
                return card;
            }
            // Check for exact keys match
            if (card.keys === template.keys) {
                return card;
            }
            // Check for partial matches in keys (like original code)
            if (card.keys && card.keys.includes("Configure Paragraph Fix")) {
                return card;
            }
            // Check for partial matches in title
            if (card.title && card.title.includes("Configure Paragraph Fix")) {
                return card;
            }
        }
        return null;
    }
    
    function createOrRepairCard() {
        let configCard = findConfigCard();
        const template = getConfigCardTemplate();
        
        if (!configCard) {
            // Create new card
            addStoryCard(template.keys);
            
            // Find and configure the newly created card
            for (let i = storyCards.length - 1; i >= 0; i--) {
                const card = storyCards[i];
                if (card.keys === template.keys) {
                    card.type = template.type;
                    card.title = template.title;
                    card.entry = template.entry;
                    card.description = template.description;
                    return card;
                }
            }
        } else {
            // Repair existing card if needed
            let needsRepair = false;
            
            // If title matches but keys don't, repair the keys
            if (configCard.title === template.title && configCard.keys !== template.keys) {
                configCard.keys = template.keys;
                needsRepair = true;
            }
            
            // If keys match but title doesn't, repair the title
            if (configCard.keys === template.keys && configCard.title !== template.title) {
                configCard.title = template.title;
                needsRepair = true;
            }
            
            // If partial matches, repair both title and keys
            if (configCard.title !== template.title && configCard.keys !== template.keys) {
                configCard.title = template.title;
                configCard.keys = template.keys;
                needsRepair = true;
            }
            
            // Always update the template parts but preserve user's settings
            const userSettings = extractSettings(configCard.entry);
            if (userSettings.formattingType) {
                PF.formattingType = userSettings.formattingType;
            }
            if (typeof userSettings.indentParagraphs === "boolean") {
                PF.indentParagraphs = userSettings.indentParagraphs;
            }
            
            // Update with current settings
            const updatedTemplate = getConfigCardTemplate();
            configCard.entry = updatedTemplate.entry;
            configCard.description = updatedTemplate.description;
            
            return configCard;
        }
        
        return null;
    }

    function applyFormatting(text, type) {
        switch (type) {
            case "basic":
                // Without dialogue formatting
                return text.replace(/\s{2,}|\n/g, '\n\n');

            case "empty-line":
                // With empty line dialogue formatting
                return text.replace(/(?<!,) (?=")|\s{2,}|\n/g, '\n\n');

            case "newline":
                // With newline dialogue formatting
                return text.replace(/\s{2,}|\n/g, '\n\n').replace(/(?<!,) (?=")/g, '\n');

            default:
                return text;
        }
    }
    
    function applyIndentation(text) {
        if (!PF.indentParagraphs) {
            return text;
        }
        
        const previousAction = readPastAction(0);
        const isAfterDoSay = ["do", "say", "see"].includes(previousAction.type);
        
        if (isAfterDoSay) {
            // Only indent if the text doesn't start with ">" (commands/dialogue)
            const lines = text.split('\n');
            return lines.map(line => {
                const trimmed = line.trimStart();
                if (trimmed.startsWith(">") || trimmed === "" || line.startsWith("    ")) {
                    return line;
                }
                return "    " + line;
            }).join('\n');
        } else {
            // Add indentation after paragraph breaks, but not to dialogue/commands
            return text.replace(/\n\n(\s*)(?=\S)(?!>)/g, (match, spaces) => {
                return '\n\n    ';
            });
        }
    }
    
    // Main logic based on hook
    switch (hook) {
        case "context":
            // Remove indentation from context so AI doesn't see it
            let contextResult = inputText.replace(/^    /gm, "");
            
            // Ensure config card exists and is properly configured
            createOrRepairCard();
            
            state.ParagraphFix = PF;
            return contextResult;
            
        case "output":
            // If formatting is "none", return unchanged
            if (!PF.formattingType || PF.formattingType === "none") {
                state.ParagraphFix = PF;
                return inputText;
            }

            // Start with the input text
            let result = inputText;

            // Apply formatting based on type
            result = applyFormatting(result, PF.formattingType);

            // Apply newline adjustment improvement
            result = adjustNewlines(result);

            // Apply indentation if enabled
            result = applyIndentation(result);

            state.ParagraphFix = PF;
            return result;
            
        default:
            state.ParagraphFix = PF;
            return inputText;
    }
}
```
8. Select the Context tab on the left
9. Delete all code within said tab
10. Copy and paste the following code into your empty Context tab:
```
// Your "Context" tab should look like this
const modifier = (text) => {
  // Your other context modifier scripts go here (preferred)
  text = ParagraphFix("context", text);
  // Your other context modifier scripts go here (alternative)
  return {text, stop};
};
modifier(text);
```
11. Select the Output tab on the left
12. Delete all code within said tab
13. Copy and paste the following code into your empty Output tab:
```
// Your "Output" tab should look like this
const modifier = (text) => {
  // Your other output modifier scripts go here (preferred)
  text = ParagraphFix("output", text);
  // Your other output modifier scripts go here (alternative)
  return {text};
};
modifier(text);
```
14. Click the big yellow SAVE button in the top right corner
15. And you're done!
16. Keep in mind that any adventures played from your scenario will include Auto-Cards (this also applies retroactively)
