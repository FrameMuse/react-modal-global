import { Dispatch, SetStateAction } from "react";
import { PopupContainerState } from "./container";
import { PopupComponent, PopupParams, PopupWindow } from "./interfaces"

type AnyIfEmpty<T extends object> = keyof T extends never ? any : T;

export const PopupPrivate: {
  dispatch: Dispatch<SetStateAction<PopupContainerState>>
} = {
  dispatch: () => { }
}

export class Popup {
  public static open
    <P extends object = {}, AC extends Partial<PopupParams> & P = Partial<PopupParams> & P>
    (component: PopupComponent<P>, ...[params]: (AnyIfEmpty<P> extends object ? [AC] : [AC?])): Promise<void> {
    return new Promise<void>(function (resolve) {
      const popupWindow = { component, params, close }
      Popup.addToQueue(popupWindow)
      function close() {
        resolve()
        Popup.removeFromQueue(popupWindow)
      }
    })
  }
  private static addToQueue(popupWindow: PopupWindow<any>) {
    PopupPrivate.dispatch(state => ({
      isActive: true,
      queue: [...state.queue, popupWindow]
    }))
  }
  private static removeFromQueue(popupWindow: PopupWindow<any>) {
    PopupPrivate.dispatch(state => {
      const queue = state.queue.filter(pw => pw !== popupWindow)
      return {
        isActive: queue.length > 0,
        queue
      }
    })
  }
  public static closeAll() {
    PopupPrivate.dispatch(state => {
      state.queue.forEach(popup => popup.close())
      return {
        isActive: false,
        queue: []
      }
    })
  }
}
