import FormHelperText from '@mui/material/FormHelperText';
import clsx from 'clsx';
import { convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import PropTypes from 'prop-types';
import { useInput } from 'ra-core';
import { Labeled, InputHelperText } from 'ra-ui-materialui';
// eslint-disable-next-line import/no-namespace,@typescript-eslint/no-unused-vars
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ContentState, Editor, EditorState } from 'react-draft-wysiwyg';
import type { TextInputProps } from 'ra-ui-materialui';

export type WysiwygInputProps = TextInputProps;

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

    const [editorState, setEditorState] = useState<EditorState | undefined>();

    useEffect(() => {
        const contentBlock = htmlToDraft(field.value);
        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            setEditorState(EditorState.createWithContent(contentState));
            return;
        }
        setEditorState(EditorState.createEmpty());
    }, [field.value]);

    const handleEditorStateChange = useCallback(
        (state: EditorState) => {
            setEditorState(state);
            field.onChange(draftToHtml(convertToRaw(state.getCurrentContent())));
            field.onBlur();
        },
        [field],
    );

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
                <Editor editorState={editorState} onEditorStateChange={handleEditorStateChange} />
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
