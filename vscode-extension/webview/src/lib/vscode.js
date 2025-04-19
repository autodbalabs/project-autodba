let vscodeApi;

export const vscode = {
    postMessage: (message) => {
        if (!vscodeApi) {
            vscodeApi = window.acquireVsCodeApi();
        }
        vscodeApi.postMessage(message);
    }
};
