import React, { Component } from 'react'
import { Table } from 'antd'
import common from '../../common'
import New from './new'
import './util.less'

class List extends Component {
  exColumns = [
    { title: '', key: 'index', dataIndex: 'index', width: 50 },
    { title: '', key: 'text', dataIndex: 'text' },
  ]
  getExTable = record => {
    return (
      <Table
        size='small'
        className='table'
        pagination={false}
        showHeader={false}
        columns={this.exColumns}
        dataSource={this.props.getExData(record)}
      />
    )
  }
  fetch = params => {
    const { pagination } = this.props.state
    common.handle(this.props.api(params), res => {
      const { total, list } = res.body
      const pager = { ...pagination }
      pager.total = total
      this.props.setState({
        data: list,
        pagination: pager,
      })
    }, this.props.setState)
  }
  handleChange = pagination => {
    const pager = { ...this.props.state.pagination }
    pager.current = pagination.current
    this.props.setState({ pagination: pager })
    this.fetch({
      skip: pagination.pageSize * (pagination.current - 1),
      limit: pagination.pageSize,
    })
  }
  componentDidMount() {
    this.fetch({
      skip: 0,
      limit: this.props.state.pagination.pageSize,
    })
  }
  render() {
    const { data, pagination, loading } = this.props.state
    return (
      <div className='list'>
        <Table 
          className='table' 
          dataSource={data}
          loading={loading}
          locale={{emptyText: '暂无数据'}}
          scroll={{ x: 375 }}
          pagination={pagination}
          onChange={this.handleChange}
          columns={this.props.columns}
          rowKey='_id'
          expandedRowRender={
            typeof this.props.getExData === 'function'
            ? this.getExTable
            : null
          }
          footer={this.props.new ? () => <New {...this.props.new}
            onChange={() => {
              const { pageSize, current } = this.props.state.pagination
              this.fetch({
                skip: pageSize * (current - 1),
                limit: pageSize,
              })
            }}/> : null}
        />
      </div>
    )
  }
}

export default List
