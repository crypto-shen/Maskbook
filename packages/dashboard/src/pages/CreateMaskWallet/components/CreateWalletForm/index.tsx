import { memo, useMemo, useState } from 'react'
import { Alert, Box, Button, makeStyles, TextField, Typography } from '@material-ui/core'
import { z as zod } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../../type'
import { MaskColorVar } from '@masknet/theme'
import { checkUppercase, checkLowercase, checkNumber } from '@masknet/shared'

const useStyles = makeStyles(() => ({
    container: {
        padding: '120px 18%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    title: {
        fontSize: 24,
        lineHeight: 1.25,
        fontWeight: 500,
    },
    form: {
        marginTop: 70,
        width: '100%',
    },
    label: {
        fontSize: 12,
        lineHeight: '16px',
        color: MaskColorVar.blue,
    },
    input: {
        width: '100%',
        marginTop: 10,
    },
    tips: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#7B8192',
        marginTop: 10,
    },
    controller: {
        marginTop: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 33%)',
        justifyContent: 'center',
        gridColumnGap: 10,
        padding: '27px 0',
    },
    button: {
        height: 48,
        borderRadius: 24,
        fontSize: 18,
    },
    alert: {
        marginTop: 24,
        padding: 24,
    },
}))

export const CreateWalletForm = memo(() => {
    const [open, setOpen] = useState(true)
    const classes = useStyles()
    const navigate = useNavigate()

    const schema = useMemo(() => {
        return zod
            .object({
                name: zod.string().min(1).max(12),
                password: zod
                    .string()
                    .min(8)
                    .max(20)
                    .refine(
                        (data) =>
                            Array.from(data).some((char) => {
                                const code = char.charCodeAt(0)
                                return checkUppercase(code)
                            }),
                        'Must contain an uppercase character',
                    )
                    .refine(
                        (data) =>
                            Array.from(data).some((char) => {
                                const code = char.charCodeAt(0)
                                return checkLowercase(code)
                            }),
                        'Must contain a lowercase character',
                    )
                    .refine(
                        (data) =>
                            Array.from(data).some((char) => {
                                const code = char.charCodeAt(0)
                                return checkNumber(code)
                            }),
                        'Must contain a number',
                    )
                    .refine(
                        (data) =>
                            Array.from(data).some((char) => {
                                const code = char.charCodeAt(0)
                                return !(checkUppercase(code) || checkLowercase(code) || checkNumber(code))
                            }),
                        'Must contain a special character',
                    ),
                confirm: zod.string().min(8).max(20),
            })
            .refine((data) => data.password === data.confirm, {
                message: "Passwords don't match",
                path: ['confirm'],
            })
    }, [])

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            password: '',
            confirm: '',
        },
    })

    const onSubmit = handleSubmit((data) => {
        const params = new URLSearchParams()
        params.set('name', data.name)
        navigate({
            pathname: RoutePaths.CreateMaskWalletMnemonic,
            search: `?${params.toString()}`,
        })
    })

    return (
        <div className={classes.container}>
            <Typography className={classes.title}>Create a wallet</Typography>
            <form className={classes.form}>
                <Box>
                    <Typography className={classes.label}>Wallet Name</Typography>
                    <Controller
                        render={({ field }) => (
                            <TextField
                                {...field}
                                error={!!errors.name?.message}
                                helperText={errors.name?.message}
                                variant="filled"
                                placeholder="Enter 1-12 characters"
                                className={classes.input}
                                InputProps={{ disableUnderline: true }}
                            />
                        )}
                        control={control}
                        name="name"
                    />
                </Box>
                <Box style={{ marginTop: 24 }}>
                    <Typography className={classes.label}>Payment Password</Typography>
                    <Controller
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                type="password"
                                variant="filled"
                                placeholder="Payment Password"
                                error={!!errors.password?.message}
                                helperText={errors.password?.message}
                                className={classes.input}
                                InputProps={{ disableUnderline: true }}
                            />
                        )}
                        name="password"
                    />
                    <Controller
                        render={({ field }) => (
                            <TextField
                                {...field}
                                error={!!errors.confirm?.message}
                                helperText={errors.confirm?.message}
                                type="password"
                                variant="filled"
                                placeholder="Re-enter the payment password"
                                className={classes.input}
                                InputProps={{ disableUnderline: true }}
                            />
                        )}
                        name="confirm"
                        control={control}
                    />
                </Box>
                <Typography className={classes.tips}>
                    The password must be between 8 and 20 characters and contains at least a number, a uppercase letter,
                    a lowercase letter and a special character.
                </Typography>
                <Box className={classes.controller}>
                    <Button color="secondary" className={classes.button}>
                        Cancel
                    </Button>
                    <Button className={classes.button} onClick={onSubmit}>
                        Next
                    </Button>
                </Box>
                {open ? (
                    <Alert severity="error" onClose={() => setOpen(false)} className={classes.alert}>
                        Do not forget to save your mnemonic phrase. You will need this to access your wallet.
                    </Alert>
                ) : null}
            </form>
        </div>
    )
})
