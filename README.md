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
## Examples
Here is an example of a generated response run through each of the three formatting modes (`basic`, `empty-line`, `newline`).
### Original Input
```
You step into the quiet tavern. The scent of smoke and ale clings to the air.
"Is anyone here?" you whisper.

A chair creaks somewhere in the back. "Over here," a voice replies.
You move closer, heart pounding. "Show yourself."
The shadows shift. "You don’t remember me, do you?" the figure says, stepping into the light.
```
### Basic Formatting
```
You step into the quiet tavern. The scent of smoke and ale clings to the air.

"Is anyone here?" you whisper.

A chair creaks somewhere in the back. "Over here," a voice replies.

You move closer, heart pounding. "Show yourself."

The shadows shift. "You don’t remember me, do you?" the figure says, stepping into the light.
```
### Empty-Line Dialogue Formatting
```
You step into the quiet tavern. The scent of smoke and ale clings to the air.

"Is anyone here?" you whisper.

A chair creaks somewhere in the back.

"Over here," a voice replies.

You move closer, heart pounding.

"Show yourself."

The shadows shift.

"You don’t remember me, do you?" the figure says, stepping into the light.
```
### Newline Dialogue Formatting
```
You step into the quiet tavern. The scent of smoke and ale clings to the air.

"Is anyone here?" you whisper.

A chair creaks somewhere in the back.

"Over here,"
a voice replies.

You move closer, heart pounding.

"Show yourself."

The shadows shift.

"You don’t remember me, do you?"
the figure says, stepping into the light.
```
# Scenario Script Installation Guide
1. Use the [AI Dungeon website](https://aidungeon.com/) on PC (or view as desktop if mobile-only)
2. [Create a new scenario](https://help.aidungeon.com/faq/what-are-scenarios) or edit one of your existing scenarios
3. Open the ```DETAILS``` tab at the top while editing your scenario
4. Scroll to the bottom and select ```EDIT SCRIPTS```
5. Select the ```Library``` tab on the left
6. Delete all code within said tab
7. Copy and paste the following code into your empty ```Library``` tab:
````js
// Your "Library" tab should look like this
/*
// Paragraph Fix Script (Eliterose's version)
// Uses Bin's Paragraph Fix formatting options and LewdLeah's suggestions
// Input newlines added based on Grand Wizard Noticer's suggestion and solution
*/
function ParagraphFix(hook, inputText) {
    "use strict";
    
    // Default settings
    const DEFAULT_FORMATTING_TYPE = "none"; // "none", "basic", "empty-line", "newline"
    const DEFAULT_INDENT_PARAGRAPHS = false; // "true" or "false"
    const DEFAULT_STORY_MODE_FORMATTING = false; // "true" or "false"
    const DEFAULT_INPUT_NEWLINES = "none"; // "none", "prepend", "append", "both"
    const DEFAULT_PIN_CONFIG_CARD = false; // "true" or "false"
    
    // Initialize or retrieve state
    const PF = (function() {
        if (state.ParagraphFix) {
            const pf = state.ParagraphFix;
            delete state.ParagraphFix;
            return pf;
        }
        return {
            formattingType: DEFAULT_FORMATTING_TYPE,
            indentParagraphs: DEFAULT_INDENT_PARAGRAPHS,
            storyModeFormatting: DEFAULT_STORY_MODE_FORMATTING,
            inputNewlines: DEFAULT_INPUT_NEWLINES,
            pinConfigCard: DEFAULT_PIN_CONFIG_CARD
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
            entry: (
                "> The Paragraph Fix ensures consistent spacing and formatting in your adventure. Edit the settings below to adjust how it behaves.\n" +
                "> Formatting Type: " + PF.formattingType + "\n" +
                "> Indent Paragraphs: " + PF.indentParagraphs + "\n" +
                "> Story Mode Formatting: " + PF.storyModeFormatting + "\n" +
                "> Input Newlines: " + PF.inputNewlines + "\n" +
                "> Pin this config card near the top: " + PF.pinConfigCard
            ),
            description: (
                "> Formatting Type controls how output text is reformatted:\n" +
                "> - none: No formatting applied\n" +
                "> - basic: Converts multiple spaces and newlines to double newlines\n" +
                "> - empty-line: Adds spacing before quotes except after commas\n" +
                "> - newline: Basic formatting plus newlines before quotes\n\n" +
                "> Indent Paragraphs adds a 4-space indent to new paragraphs\n" +
                "> (true or false)\n\n" +
                "> Story Mode Formatting applies the full formatting pipeline to user input in Story mode\n" +
                "> (true or false)\n\n" +
                "> Input Newlines adds \\n\\n before and/or after user input actions, ensuring Story mode\n" +
                "> insertions don't run inline with surrounding output\n" +
                "> (none, prepend, append, or both)\n\n" +
                "> Pin this config card near the top keeps this card pinned high in your story cards list\n" +
                "> (true or false)"
            )
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

            const trueValues = ["true", "t", "yes", "y", "on"];
            const falseValues = ["false", "f", "no", "n", "off"];

            if (key.includes("formatting") && key.includes("type")) {
                const validTypes = ["none", "basic", "empty-line", "emptyline", "newline"];
                if (validTypes.includes(value)) {
                    settings.formattingType = value.replace("emptyline", "empty-line");
                }
            }

            if (key.includes("indent") && key.includes("paragraphs")) {
                if (trueValues.includes(value)) settings.indentParagraphs = true;
                else if (falseValues.includes(value)) settings.indentParagraphs = false;
            }

            if (key.includes("story") && key.includes("mode")) {
                if (trueValues.includes(value)) settings.storyModeFormatting = true;
                else if (falseValues.includes(value)) settings.storyModeFormatting = false;
            }

            if (key.includes("input") && key.includes("newlines")) {
                const validTypes = ["none", "prepend", "append", "both"];
                if (validTypes.includes(value)) settings.inputNewlines = value;
            }

            if (key.includes("pin")) {
                if (trueValues.includes(value)) settings.pinConfigCard = true;
                else if (falseValues.includes(value)) settings.pinConfigCard = false;
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
            // Repair title/keys if damaged
            if (configCard.title !== template.title) configCard.title = template.title;
            if (configCard.keys !== template.keys) configCard.keys = template.keys;

            // Read user's settings back from the card and apply them
            const userSettings = extractSettings(configCard.entry);
            if (userSettings.formattingType !== undefined) PF.formattingType = userSettings.formattingType;
            if (typeof userSettings.indentParagraphs === "boolean") PF.indentParagraphs = userSettings.indentParagraphs;
            if (typeof userSettings.storyModeFormatting === "boolean") PF.storyModeFormatting = userSettings.storyModeFormatting;
            if (userSettings.inputNewlines !== undefined) PF.inputNewlines = userSettings.inputNewlines;
            if (typeof userSettings.pinConfigCard === "boolean") PF.pinConfigCard = userSettings.pinConfigCard;

            // Rewrite card with current settings so it stays canonical
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
                        return text.replace(/\n\n\s*(?=\S)(?!>)/g, () => '\n\n    ');
        }
    }
    
    // Main logic based on hook
    switch (hook) {
        case "context": {
            // Remove indentation from context so the AI doesn't see it
            const contextResult = inputText.replace(/^    /gm, "");

            // Ensure config card exists, is properly formed, and settings are read back from it
            const configCard = createOrRepairCard();

            // Pin config card if enabled
            if (PF.pinConfigCard && configCard) {
                const index = storyCards.indexOf(configCard);
                if (0 < index) {
                    storyCards.splice(index, 1);
                    storyCards.unshift(configCard);
                }
            }

            state.ParagraphFix = PF;
            return contextResult;
        }

        case "input": {
            let res = inputText;

            // Toggle 1: Prepend and/or append \n\n to user input.
            // Fixes Story mode's inline insertion leaving no paragraph gap before/after user input.
            // Works independently of formatting type and storyModeFormatting.
            if (PF.inputNewlines === "prepend" || PF.inputNewlines === "both") {
                res = "\n\n" + res.trimStart();
            }
            if (PF.inputNewlines === "append" || PF.inputNewlines === "both") {
                res = res.trimEnd() + "\n\n";
            }

            // Toggle 2: Apply full formatting pipeline to user input in Story mode.
            if (PF.formattingType && PF.formattingType !== "none" && PF.storyModeFormatting) {
                res = applyFormatting(res, PF.formattingType);
                res = adjustNewlines(res);
                res = applyIndentation(res);
            }
            state.ParagraphFix = PF;
            return res;
        }

        case "output": {
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
        }

        default:
            state.ParagraphFix = PF;
            return inputText;
    }
}
````
8. Select the Input tab on the left
9. Delete all code within said tab
10. Copy and paste the following code into your empty Input tab:
````js
// Your "Input" tab should look like this
const modifier = (text) => {
  // Your other input modifier scripts go here
  text = ParagraphFix("input", text);
  // Your other input modifier scripts go here
  return {text};
};
modifier(text);
````
11. Select the ```Context``` tab on the left
12. Delete all code within said tab
13. Copy and paste the following code into your empty ```Context``` tab:
````js
// Your "Context" tab should look like this
const modifier = (text) => {
  // Your other context modifier scripts go here
  text = ParagraphFix("context", text);
  // Your other context modifier scripts go here
  return {text};
};
modifier(text);
````
14. Select the ```Output``` tab on the left
15. Delete all code within said tab
16. Copy and paste the following code into your empty ```Output``` tab:
````js
// Your "Output" tab should look like this
const modifier = (text) => {
  // Your other output modifier scripts go here
  text = ParagraphFix("output", text);
  // Your other output modifier scripts go here
  return {text};
};
modifier(text);
````
17. Click the big yellow ```SAVE``` button in the top right corner
18. And you're done!
19. Keep in mind that any adventures played from your scenario will include the Paragraph Fix (this also applies retroactively)
## Additional Resources
### Simple Test Scenario
- [Paragraph Fix](https://play.aidungeon.com/scenario/eCbkYrNVikOm/paragraph-fix-v2-test-suggestions-and-feedback)
### My AI Dungeon Profile
- [Eliterose](https://play.aidungeon.com/profile/Eliterose)
