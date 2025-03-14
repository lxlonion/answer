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

import { FC } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams, Link } from 'react-router-dom';

import { usePageTags } from '@/hooks';
import { Pagination, FormatTime, Empty } from '@/components';
import { loggedUserInfoStore } from '@/stores';
import {
  usePersonalInfoByName,
  usePersonalTop,
  usePersonalListByTabName,
} from '@/services';
import type { UserInfoRes } from '@/common/interface';

import {
  UserInfo,
  NavBar,
  Overview,
  Alert,
  ListHead,
  DefaultList,
  Reputation,
  Comments,
  Answers,
  Votes,
  Badges,
} from './components';

const Personal: FC = () => {
  // 从 URL 参数中获取 tabName 和 username
  const { tabName = 'overview', username = '' } = useParams();
  // 获取查询参数
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') || 1;
  const order = searchParams.get('order') || 'newest';
  // 使用 i18n 进行国际化翻译
  const { t } = useTranslation('translation', { keyPrefix: 'personal' });
  // 获取当前登录用户信息
  const sessionUser = loggedUserInfoStore((state) => state.user);
  const isSelf = sessionUser?.username === username;

  // 获取用户信息
  const { data: userInfo } = usePersonalInfoByName(username);
  // 获取用户顶部数据
  const { data: topData } = usePersonalTop(username, tabName);

  // 获取用户列表数据
  const { data: listData, isLoading = true } = usePersonalListByTabName(
    {
      username,
      page: Number(page),
      page_size: 30,
      order,
    },
    tabName,
  );
  const { count = 0, list = [] } = listData?.[tabName] || {};

  // 设置页面标题
  let pageTitle = '';
  if (userInfo?.username) {
    pageTitle = `${userInfo?.display_name} (${userInfo?.username})`;
  }
  usePageTags({
    title: pageTitle,
  });

  return (
    <div className="pt-4 mb-5">
      <Row>
        <Col>
          {/* 显示用户状态信息 */}
          {userInfo?.status !== 'normal' && userInfo?.status_msg && (
            <Alert data={userInfo?.status_msg} />
          )}
          <div className="d-md-flex d-block flex-wrap justify-content-between">
            {/* 显示用户信息 */}
            <UserInfo data={userInfo as UserInfoRes} />
            {/* 如果是当前用户，显示编辑按钮 */}
            {isSelf && (
              <div className="mb-3">
                <Link
                  className="btn btn-outline-secondary"
                  to="/users/settings/profile">
                  {t('edit_profile')}
                </Link>
              </div>
            )}
          </div>
          {/* 导航栏 */}
          <NavBar tabName={tabName} slug={username} isSelf={isSelf} />

          {/* 概览信息 */}
          <Overview
            visible={tabName === 'overview'}
            introduction={userInfo?.bio_html || ''}
            data={topData}
            username={username}
          />

          {/* 列表头部 */}
          <ListHead
            count={tabName === 'reputation' ? Number(userInfo?.rank) : count}
            sort={order}
            visible={tabName !== 'overview'}
            tabName={tabName}
          />
          {/* 回答列表 */}
          <Answers data={list} visible={tabName === 'answers'} />
          {/* 默认列表 */}
          <DefaultList
            data={list}
            tabName={tabName}
            visible={tabName === 'questions' || tabName === 'bookmarks'}
          />
          {/* 声誉列表 */}
          <Reputation data={list} visible={tabName === 'reputation'} />
          {/* 评论列表 */}
          <Comments data={list} visible={tabName === 'comments'} />
          {/* 投票列表 */}
          <Votes data={list} visible={tabName === 'votes'} />
          {/* 徽章列表 */}
          <Badges
            data={list}
            visible={tabName === 'badges'}
            username={username}
          />
          {/* 如果列表为空且不在加载中，显示空状态 */}
          {!list?.length && !isLoading && <Empty />}

          {/* 分页 */}
          {count > 0 && (
            <div className="d-flex justify-content-center py-4">
              <Pagination
                pageSize={30}
                totalSize={count || 0}
                currentPage={Number(page)}
              />
            </div>
          )}

          {/* 概览页的统计信息 */}
          {tabName === 'overview' && (
            <>
              <h5 className="mb-3">{t('stats')}</h5>
              {userInfo?.created_at && (
                <div className="text-secondary">
                  <FormatTime time={userInfo.created_at} preFix={t('joined')} />
                  {t('comma')}{' '}
                  <FormatTime
                    time={userInfo.last_login_date}
                    preFix={t('last_login')}
                  />
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};
export default Personal;
