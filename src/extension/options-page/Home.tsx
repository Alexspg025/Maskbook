import React from 'react'

import { makeStyles, createStyles } from '@material-ui/styles'
import {
    Theme,
    Typography,
    Card,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Container,
} from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'
import { useMyPersonas } from '../../components/DataSource/useActivatedUI'
import Services from '../service'
import { DialogRouter } from './DashboardDialogs/DialogBase'

import PersonaCard from './DashboardComponents/PersonaCard'
import { DatabaseRestoreDialog } from './DashboardDialogs/Database'
import {
    PersonaCreateDialog,
    PersonaCreatedDialog,
    PersonaImportSuccessDialog,
    PersonaImportFailedDialog,
    PersonaImportDialog,
} from './DashboardDialogs/Persona'
import ActionButton from './DashboardComponents/ActionButton'
import FooterLine from './DashboardComponents/FooterLine'
import { geti18nString } from '../../utils/i18n'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        sections: {
            width: '100%',
            marginTop: theme.spacing(2),
        },
        title: {
            marginTop: theme.spacing(3),
            marginBottom: theme.spacing(1),
        },
        button: {
            width: 120,
        },
        secondaryAction: {
            paddingRight: 120,
        },
        actionButtons: {
            margin: theme.spacing(2),
        },
        loaderWrapper: {
            position: 'relative',
            '&:not(:last-child)': {
                marginBottom: theme.spacing(2),
            },
        },
        loader: {
            width: '100%',
            bottom: 0,
            position: 'absolute',
        },
        identity: {
            '&:not(:first-child)': {
                marginTop: theme.spacing(2),
            },
        },
    }),
)

const ListItemWithAction = (props: any) => {
    const { secondaryAction } = useStyles()
    return <ListItem classes={{ secondaryAction }} {...props} />
}

export default function DashboardHomePage() {
    const [exportLoading, setExportLoading] = React.useState(false)

    const classes = useStyles()
    const personas = useMyPersonas()

    const exportData = () => {
        // FIXME:
        setExportLoading(true)
        Services.Welcome.backupMyKeyPair({
            download: true,
            onlyBackupWhoAmI: false,
        })
            .catch(alert)
            .then(() => setExportLoading(false))
    }

    const history = useHistory()

    const dialogs = (
        <>
            <DialogRouter path="/database/restore" children={<DatabaseRestoreDialog />} />
            <DialogRouter path="/persona/create" children={<PersonaCreateDialog />} />
            <DialogRouter path="/persona/created" children={<PersonaCreatedDialog />} />
            <DialogRouter path="/persona/import" children={<PersonaImportDialog />} />
            <DialogRouter path="/persona/success" children={<PersonaImportSuccessDialog />} />
            <DialogRouter path="/persona/failed" children={<PersonaImportFailedDialog />} />
        </>
    )

    React.useEffect(() => {
        Services.Identity.queryMyPersonas().then(personas => !personas.length && history.replace('/initialize'))
    }, [history])

    return (
        <Container maxWidth="md">
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    {geti18nString('dashboard_my_personas')}
                </Typography>
                {!personas.length && (
                    <Card raised elevation={1}>
                        <List disablePadding>
                            <ListItemWithAction key="initialize">
                                <ListItemText primary="No persona was found" />
                                <ListItemSecondaryAction>
                                    <ActionButton
                                        component={Link}
                                        to="/initialize"
                                        variant="contained"
                                        color="primary"
                                        className={classes.button}>
                                        Initialize
                                    </ActionButton>
                                </ListItemSecondaryAction>
                            </ListItemWithAction>
                        </List>
                    </Card>
                )}
                <div>
                    {personas.map((i, index) => (
                        <Card key={`cardIdentity-${index}`} className={classes.identity} raised elevation={1}>
                            <PersonaCard persona={i} key={i.identifier.toText()} />
                        </Card>
                    ))}
                </div>
            </section>
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    {geti18nString('add_persona')}
                </Typography>
                <Card raised elevation={1}>
                    <List disablePadding>
                        <ListItemWithAction key="persona-create">
                            <ListItemText
                                primary={geti18nString('create')}
                                secondary={geti18nString('dashboard_create_persona_hint')}
                            />
                            <ListItemSecondaryAction>
                                <ActionButton
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    component={Link}
                                    to="persona/create">
                                    {geti18nString('create')}
                                </ActionButton>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                        <Divider></Divider>
                        <ListItemWithAction key="persona-import">
                            <ListItemText
                                primary={geti18nString('import')}
                                secondary={geti18nString('dashboard_import_persona_hint')}
                            />
                            <ListItemSecondaryAction>
                                <ActionButton
                                    variant="outlined"
                                    color="default"
                                    className={classes.button}
                                    component={Link}
                                    to="persona/import">
                                    {geti18nString('import')}
                                </ActionButton>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                    </List>
                </Card>
            </section>
            <section className={classes.sections}>
                <Typography className={classes.title} variant="h5" align="left">
                    {geti18nString('database')}
                </Typography>
                <Card raised elevation={1}>
                    <List disablePadding>
                        <ListItemWithAction key="dashboard-backup">
                            <ListItemText
                                primary={geti18nString('backup')}
                                secondary={geti18nString('dashboard_backup_database_hint')}
                            />
                            <ListItemSecondaryAction>
                                <ActionButton
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    component={'a'}
                                    loading={exportLoading}
                                    onClick={exportData}>
                                    {geti18nString('backup')}
                                </ActionButton>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                        <Divider></Divider>
                        <ListItemWithAction key="dashboard-restore">
                            <ListItemText
                                primary={geti18nString('restore')}
                                secondary={geti18nString('dashboard_import_database_hint')}
                            />
                            <ListItemSecondaryAction>
                                <ActionButton
                                    variant="outlined"
                                    color="default"
                                    className={classes.button}
                                    component={Link}
                                    to="database/restore">
                                    {geti18nString('restore')}
                                </ActionButton>
                            </ListItemSecondaryAction>
                        </ListItemWithAction>
                    </List>
                </Card>
            </section>
            <section className={classes.sections}>
                <FooterLine />
            </section>
            {dialogs}
        </Container>
    )
}
