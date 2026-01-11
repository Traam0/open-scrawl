import { Action } from "@dnd-kit/core/dist/store";
import { create } from "zustand";

type State = {};

type Actions = {};

const useClean = create<State & Action>();
