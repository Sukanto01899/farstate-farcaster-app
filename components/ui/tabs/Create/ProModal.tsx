import React from "react";
import Modal from "../../common/Modal";
import { X } from "lucide-react";

const ProModal = ({
  setShowProModal,
}: {
  setShowProModal: (val: boolean) => void;
}) => {
  return (
    <Modal>
      <div className="bg-purple-800 w-full p-4 rounded-xl relative text-white">
        <span
          onClick={() => setShowProModal(false)}
          className="absolute right-3 top-3 hover:bg-purple-900 p-1 rounded-full cursor-pointer"
        >
          <X />
        </span>
        <h1 className="text-center text-xl font-semibold mb-4 ">
          Farstate Ai Pro
        </h1>

        {/* Limit */}
        {/* <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-900 text-center rounded-lg px-2 py-1.5 border border-purple-600">
            <p className="text-purple-200 text-xs ">Daily Cast</p>
            <p className={`  text-sm font-bold text-center text-white`}>20</p>
          </div>
          <div className="bg-purple-900 text-center rounded-lg px-2 py-1.5 border border-purple-600">
            <p className="text-purple-200 text-xs">Daily Thumbnail</p>
            <p className={`  text-sm font-bold text-center text-white`}>10</p>
          </div>
        </div> */}

        {/* Month */}
        {/* <h3 className="mt-4 mb-2">Select month</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-purple-800 text-center rounded-lg px-2 py-1.5 border border-purple-600">
            <p className={`  text-sm font-bold text-center text-white`}>
              1 Month
            </p>
          </div>
          <div className="bg-purple-800 text-center rounded-lg px-2 py-1.5 border border-purple-600">
            <p className={`  text-sm font-bold text-center text-white`}>
              3 Month
            </p>
          </div>
          <div className="bg-purple-800 text-center rounded-lg px-2 py-1.5 border border-purple-600">
            <p className={`  text-sm font-bold text-center text-white`}>
              6 Month
            </p>
          </div>
        </div> */}

        <button className="w-full bg-purple-500 mt-4 py-3 rounded-xl">
          Coming soon
        </button>
      </div>
    </Modal>
  );
};

export default ProModal;
