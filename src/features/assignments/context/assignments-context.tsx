import useDialogState from '@/hooks/use-dialog-state'
import React, { useState } from 'react'
import { type Assignment } from '../data/types'

type assignmentsDialogType = 'add' | 'edit' | 'delete'

interface assignmentsContextType {
    open: assignmentsDialogType | null
    setOpen: (str: assignmentsDialogType | null) => void
    currentRow: Assignment | null
    setCurrentRow: React.Dispatch<React.SetStateAction<Assignment | null>>
}

const AssignmentsContext = React.createContext<assignmentsContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function AssignmentsProvider({ children }: Props) {
    const [open, setOpen] = useDialogState<assignmentsDialogType>(null)
    const [currentRow, setCurrentRow] = useState<Assignment | null>(null)

    return (
        <AssignmentsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </AssignmentsContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAssignmentsContext = () => {
    const assignmentsContext = React.useContext(AssignmentsContext)

    if (!assignmentsContext) {
        throw new Error('useassignments has to be used within <assignmentsContext>')
    }

    return assignmentsContext
}