import { assistStartModal } from "./assist/start";

// Getter for all available modals
export function getModal(id: String) {
    switch (id) {
        case 'auto_assist-start': {
            return assistStartModal
        }
    }
}

/*
Assist modals are given custom ID's according to the following format:
auto_assist-{MODAL}[-{ACTION}]
So to get the start modal, you would do getModal('auto_assist-start')
And in order to react to that modals actions, you would react to e.g. 'auto_assist-start-yes'
*/
export function getAssistModal(id: String) {
    const mod = getModal(`auto_assist-${id}`)
    mod.modal.setCustomId(`auto_assist-${id}`)
    return mod
}
