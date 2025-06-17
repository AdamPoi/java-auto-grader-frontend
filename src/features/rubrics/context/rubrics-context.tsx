import useDialogState from '@/hooks/use-dialog-state'
import React, { useState } from 'react'
import { type Rubric } from '../data/types'

type rubricsDialogType = 'add' | 'edit' | 'delete'

interface rubricsContextType {
    open: rubricsDialogType | null
    setOpen: (str: rubricsDialogType | null) => void
    rubric: Rubric | null
    setRubric: React.Dispatch<React.SetStateAction<Rubric | null>>
}

const RubricsContext = React.createContext<rubricsContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function RubricsProvider({ children }: Props) {
    const [open, setOpen] = useDialogState<rubricsDialogType>(null)
    const [rubric, setRubric] = useState<Rubric | null>(null)

    return (
        <RubricsContext.Provider value={{ open, setOpen, rubric, setRubric }}>
            {children}
        </RubricsContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRubricsContext = () => {
    const rubricsContext = React.useContext(RubricsContext)

    if (!rubricsContext) {
        throw new Error('useRubrics has to be used within <RubricsContext>')
    }

    return rubricsContext
}