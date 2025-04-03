/**
 * Extracts file paths from a drag-and-drop event.
 * Uses dataTransfer.files if available; otherwise, falls back to dataTransfer.items.
 * 
 * @param {DragEvent} e - The drag event from which to extract files.
 * @returns {string[]} - An array of file paths.
 */

export function loadFilesFromEvent(e) {
    let files = [];

    // First, try using dataTransfer.files
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        files = Array.from(e.dataTransfer.files);
    }
    // If no files, try using dataTransfer.items as fallback
    else if (e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        files = Array.from(e.dataTransfer.items)
            .filter(item => item.kind === 'file')
            .map(item => item.getAsFile());
    }

    // Extract file paths from file objects
    const filePaths = files.map(file => {
        console.log('[fileLoader] File object:', file);
        return file.path;
    }).filter(p => !!p);

    if (filePaths.length === 0 && e.dataTransfer) {
        const uri = e.dataTransfer.getData('text/uri-list');

        if (uri) {
            const pathFromUri = decodeURI(uri.replace('file://', ''));
            filePaths.push(pathFromUri);
        }
    }

    return filePaths;
}   
