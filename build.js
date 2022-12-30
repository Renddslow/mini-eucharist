const fs = require("fs");
const path = require("path");
const templite = require("templite");
const prettier = require("prettier");
const { minify } = require("html-minifier-terser");

const bold = (text) => text.replaceAll(/\*\*(.*)\*\*/g, "<strong>$1</strong>");

const parseMarkdownByLine = (markdown) => {
  const lines = markdown.split("\n");
  const parsedLines = lines.map((line) => {
    // if the line is a heading, return a heading tag
    if (line.startsWith("#")) {
      const headingLevel = line.match(/#+/)[0].length;
      const headingText = line.replace(/#+/, "");
      return `<h${headingLevel}>${headingText.trim()}</h${headingLevel}>`;
    }
    if (!line) {
      return null;
    }

    if (line.startsWith(">")) {
      const indentation = line.match(/^>+/)[0].length;
      const indentationText = line.replace(/^>+/g, "").trim();
      return `<p class="in in-${indentation - 1}">${bold(indentationText)}</p>`;
    }

    if (line.startsWith('<>')) {
      return '<div class="block">';
    }

    if (line.startsWith('</>')) {
      return '</div>';
    }
    // if the line is a paragraph, return a paragraph tag
    return `<p>${bold(line)}</p>`;
  });
  return parsedLines.filter((p) => p).join("\n");
};

const main = async () => {
  // read the template file
  const template = fs.readFileSync(
    path.join(__dirname, "template.html"),
    "utf8"
  );
  // read the styles file
  const styles = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");
  // read the content file
  const content = fs.readFileSync(path.join(__dirname, "content.md"), "utf8");
  const renderedHTML = templite(template, {
    content: parseMarkdownByLine(content),
    styles,
  });

  if (!fs.existsSync(path.join(__dirname, "public"))) {
    fs.mkdirSync(path.join(__dirname, "public"));
  }
  fs.writeFileSync(
    path.join(__dirname, "public", "index.html"),
    await minify(
      prettier.format(renderedHTML, {
        parser: "html",
      }),
      {
        minifyCSS: true,
        collapseWhitespace: true,
      }
    )
  );
};

main();
