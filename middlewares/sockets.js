const constants = require("../constants/socket-constants");

const listeners = [];

module.exports = (io, socket) => {
    socket.on(constants.addListener, async (listenerName) => {
        try {
            listeners.push(listenerName);
        } catch (e) {
            socket.emit(constants.error, e);
        }
    });

    // FOR DEBUGGING ONLY
    // setInterval(() => {
    //     socket.emit(constants.informListener, listeners[0])
    // }, 7000)
};
