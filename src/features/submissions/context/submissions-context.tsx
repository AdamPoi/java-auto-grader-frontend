import useDialogState from '@/hooks/use-dialog-state'
import React, { useState } from 'react'
import { type Submission } from '../data/types'

type SubmissionsDialogType = 'delete'

interface SubmissionsContextType {
    open: SubmissionsDialogType | null
    setOpen: (str: SubmissionsDialogType | null) => void
    currentRow: Submission | null
    setCurrentRow: React.Dispatch<React.SetStateAction<Submission | null>>
}

const SubmissionsContext = React.createContext<SubmissionsContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function SubmissionsProvider({ children }: Props) {
    const [open, setOpen] = useDialogState<SubmissionsDialogType>(null)
    const [currentRow, setCurrentRow] = useState<Submission | null>(null)

    return (
        <SubmissionsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </SubmissionsContext>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSubmissionsContext = () => {
    const submissionsContext = React.useContext(SubmissionsContext)

    if (!submissionsContext) {
        throw new Error('useSubmissions has to be used within <SubmissionsContext>')
    }

    return submissionsContext
}
