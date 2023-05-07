module.exports = {
    // getRoomName: (id) => `room${id}` (as an example)

    // backend: on | frontend: emit
    connection: "connection",
    disconnect: "disconnect",

    addListener: 'add-listener',

    // backend: emit | frontend: on
    informListener: 'inform-listener',

    error: "error-message",
};
