"use strict";

module.exports = {
    getMarkdownForTree
};

function getMarkdownForTree(tree, environment) {
    const lines = getMarkdownLinesForTree(tree, [], environment);
    return lines.join(environment.endOfLine);
}

function getMarkdownLinesForTree(tree, parentPathParts, environment) {
    const markdownLines = [];
    const indentationUnit = getIndentationUnit(environment);

    for (const treeNode of tree) {
        const markdownForTreeNode = getMarkdownForTreeNode(treeNode, parentPathParts, environment);

        markdownLines.push(...markdownForTreeNode.split(environment.endOfLine));

        if (treeNode.isDirectory) {
            const fullPathParts = [...parentPathParts, treeNode.filename];

            const linesForChildren = getMarkdownLinesForTree(
                treeNode.children,
                fullPathParts,
                environment
            );

            const indentedLines = linesForChildren.map(line => indentationUnit + line);
            markdownLines.push(...indentedLines);
        }
    }

    return markdownLines;
}

function getIndentationUnit(environment) {
    // Markdown standard: either four spaces or tabs
    if (environment.options.useTabs) {
        return "\t";
    } else {
        return " ".repeat(4);
    }
}

function getMarkdownForTreeNode(treeNode, parentPath, environment) {
    const linkText = getLinkTextForTreeNode(treeNode);
    const linkTarget = getLinkTargetForTreeNode(treeNode, parentPath, environment);

    const basicLine = `- [${linkText}](${linkTarget})`;

    if (treeNode.description) {
        const descriptionSeparator = getDescriptionSeparator(environment);
        return basicLine + descriptionSeparator + treeNode.description;
    } else {
        return basicLine;
    }
}

function getLinkTextForTreeNode(treeNode) {
    if (treeNode.isDirectory) {
        return `**${treeNode.title}**`;
    } else {
        return treeNode.title;
    }
}

function getLinkTargetForTreeNode(treeNode, parentPathParts, environment) {
    const fullPathParts = [...parentPathParts, treeNode.filename];
    let linkTarget = fullPathParts.join("/");

    if (treeNode.isDirectory && environment.options.linkToSubdirectoryReadme) {
        linkTarget = linkTarget + "/README.md";
    }

    return linkTarget;
}

function getDescriptionSeparator(environment) {
    if (environment.options.subdirectoryDescriptionOnNewLine) {
        return "  " + environment.endOfLine + getIndentationUnit(environment);
    } else {
        return " - ";
    }
}
