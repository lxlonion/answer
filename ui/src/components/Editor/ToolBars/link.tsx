/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useEffect, useRef, useState, memo } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import ToolItem from '../toolItem';
import { IEditorContext } from '../types';
import { loggedUserInfoStore } from '@/stores';
import { loggedUserInfoStore } from '@/stores';

let context: IEditorContext;
/**
 * Link 组件，用于在编辑器中插入链接。
 */
const Link = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'editor' });
  // 定义工具栏项的属性
  const item = {
    label: 'link-45deg',
    keyMap: ['Ctrl-l'],
    tip: `${t('link.text')} (Ctrl+l)`,
  };
  // 控制 Modal 的显示与隐藏
  const { user } = loggedUserInfoStore();
  const [visible, setVisible] = useState(false);
  // 存储链接的 URL 和验证状态
  const [link, setLink] = useState({
    value: 'https://',
    isInvalid: false,
    errorMsg: '',
  });
  // 存储链接的名称和验证状态
  const [name, setName] = useState({
    value: '',
    isInvalid: false,
    errorMsg: '',
  });
  // 用于获取 URL 输入框的引用
  const inputRef = useRef<HTMLInputElement>(null);

  // 当 Modal 显示时，自动选中 URL 输入框中的内容并聚焦
  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.setSelectionRange(0, inputRef.current.value.length);
      inputRef.current.focus();
    }
  }, [visible]);

  /**
   * addLink 函数，用于打开链接 Modal。
   * @param {IEditorContext} ctx 编辑器上下文
   */
  const addLink = (ctx) => {
    context = ctx;
    const { editor } = context;

    const text = editor.getSelection();

    setName({ ...name, value: text });

    setVisible(true);
  };
  /**
   * handleClick 函数，用于处理点击确认按钮的事件。
   */
  const handleClick = () => {
    const { editor } = context;

    if (!link.value) {
      setLink({ ...link, isInvalid: true });
      return;
    }
    const newStr = name.value
      ? `[${name.value}](${link.value})`
      : `<${link.value}>`;

    editor.replaceSelection(newStr);

    setVisible(false);

    editor.focus();
    setLink({ ...link, value: '' });
    setName({ ...name, value: '' });
  };
  // 关闭 Modal
  const onHide = () => setVisible(false);
  // Modal 关闭后的回调，用于聚焦编辑器
  const onExited = () => {
    const { editor } = context;
    editor.focus();
  };
  const handleFillUserInfo = () => {
    setName({ ...name, value: `${user.display_name} (${user.username})` });
  };

  return (
    <>
      <ToolItem {...item} onClick={addLink} />
      <Modal
        show={visible}
        onHide={onHide}
        onExited={onExited}
        fullscreen="sm-down">
        <Modal.Header closeButton>
          <h5 className="mb-0">{t('link.add_link')}</h5>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleClick}>
            <Form.Group controlId="editor.internetSite" className="mb-3">
              <Form.Label>{t('link.form.fields.url.label')}</Form.Label>
              <Form.Control
                ref={inputRef}
                type="text"
                value={link.value}
                onChange={(e) => setLink({ ...link, value: e.target.value })}
                isInvalid={link.isInvalid}
              />
              <Button variant="link" onClick={handleFillUserInfo}>
                {t('link.fill_user_info')}
              </Button>
            </Form.Group>

            <Form.Group controlId="editor.internetSiteName" className="mb-3">
              <Form.Label>{`${t('link.form.fields.name.label')} ${t(
                'optional',
                {
                  keyPrefix: 'form',
                },
              )}`}</Form.Label>
              <Form.Control
                type="text"
                value={name.value}
                onChange={(e) => setName({ ...name, value: e.target.value })}
                isInvalid={name.isInvalid}
              />
              <Button variant="link" onClick={handleFillUserInfo}>
                {t('link.fill_user_info')}
              </Button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" onClick={() => setVisible(false)}>
            {t('link.btn_cancel')}
          </Button>
          <Button variant="primary" onClick={handleClick}>
            {t('link.btn_confirm')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default memo(Link);
