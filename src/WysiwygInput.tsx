import FormHelperText from '@mui/material/FormHelperText';
import clsx from 'clsx';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import PropTypes from 'prop-types';
import { useInput } from 'ra-core';
import { Labeled, InputHelperText } from 'ra-ui-materialui';
// eslint-disable-next-line import/no-namespace,@typescript-eslint/no-unused-vars
import * as React from 'react';
import { Component, memo } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import type { TextInputProps } from 'ra-ui-materialui';
import type { ControllerRenderProps } from 'react-hook-form';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export type WysiwygInputProps = TextInputProps;

class WysiwygInputClass extends Component<ControllerRenderProps, { editorState: EditorState }> {
    constructor(props: ControllerRenderProps) {
        super(props);
        const contentBlock = htmlToDraft(props.value);
        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            this.state = {
                editorState,
            };
        }
    }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
        });
        const { onChange, onBlur } = this.props;
        // eslint-disable-next-line react/destructuring-assignment
        onChange(draftToHtml(convertToRaw(editorState.getCurrentContent())));
        onBlur();
    };

    render() {
        const { editorState } = this.state;
        return (
            <div>
                <Editor
                    editorState={editorState}
                    wrapperClassName="wysiwyg-wrapper"
                    editorClassName="wysiwyg-editor"
                    onEditorStateChange={this.onEditorStateChange}
                />
                <textarea disabled value={draftToHtml(convertToRaw(editorState.getCurrentContent()))} />
            </div>
        );
    }
}

export const WysiwygInput = ({
    className,
    defaultValue,
    label,
    format,
    helperText,
    onBlur,
    onChange,
    parse,
    resource,
    source,
    validate,
    ...rest
}: WysiwygInputProps) => {
    const {
        field,
        fieldState: { error, invalid, isTouched },
        formState: { isSubmitted },
        id,
        isRequired,
    } = useInput({
        defaultValue,
        format,
        parse,
        resource,
        source,
        type: 'text',
        validate,
        onBlur,
        onChange,
        ...rest,
    });

    const renderHelperText = helperText !== false || ((isTouched || isSubmitted) && invalid);
    const isError = (isTouched || isSubmitted) && invalid;

    return (
        <div id={id} className={clsx('ra-input', `ra-input-${source}`, className)}>
            <Labeled
                isRequired={isRequired}
                label={label}
                id={`${id}-label`}
                color={invalid ? 'error' : undefined}
                source={source}
                resource={resource}
                fullWidth
            >
                <WysiwygInputClass {...field} />
            </Labeled>
            {renderHelperText ? (
                <FormHelperText error={isError}>
                    <InputHelperText
                        touched={isTouched || isSubmitted}
                        error={error?.message}
                        helperText={helperText}
                    />
                </FormHelperText>
            ) : null}
        </div>
    );
};

WysiwygInput.propTypes = {
    className: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.element]),
    options: PropTypes.object,
    resource: PropTypes.string,
    source: PropTypes.string,
};

WysiwygInput.defaultProps = {
    options: {},
};

export default memo(WysiwygInput);
