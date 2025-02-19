import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { PageInspector, PageInspectorProps } from '../../../components/InjectedComponents/PageInspector.js'
import { attachReactTreeWithoutContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'

export interface InjectPageInspectorDefaultConfig {}

export function injectPageInspectorDefault<T extends string>(
    config: InjectPageInspectorDefaultConfig = {},
    additionalPropsToPageInspector: (classes: Record<T, string>) => Partial<PageInspectorProps> = () => ({}),
    useCustomStyles: (props?: any) => {
        classes: Record<T, string>
    } = makeStyles()({}) as any,
) {
    const PageInspectorDefault = memo(function PageInspectorDefault() {
        const { classes } = useCustomStyles()
        const additionalProps = additionalPropsToPageInspector(classes)
        return <PageInspector {...additionalProps} />
    })

    return function injectPageInspector(signal: AbortSignal) {
        attachReactTreeWithoutContainer('page-inspector', <PageInspectorDefault />, signal)
    }
}
