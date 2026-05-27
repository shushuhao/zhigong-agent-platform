/**
 * 测试 URL 参数获取函数
 * 验证修复：确保 kindParam 不会是 undefined
 */

import { getUrlParams, getAnnotationType } from '../urlParams';

describe('getUrlParams', () => {
  // 保存原始的 window.location
  const originalLocation = window.location;

  beforeEach(() => {
    // 重置 window.location
    delete (window as any).location;
    (window as any).location = { search: '' };
  });

  afterEach(() => {
    // 恢复原始的 window.location
    (window as any).location = originalLocation;
  });

  it('should return default values when no URL parameters are provided', () => {
    (window as any).location.search = '';
    const params = getUrlParams();

    expect(params.rId).toBe('1');
    expect(params.tId).toBe('');
    expect(params.kindParam).toBe('1');
    expect(params.name).toBe('');
  });

  it('should parse URL parameters correctly', () => {
    (window as any).location.search = '?rId=123&tId=456&kind=2&name=test';
    const params = getUrlParams();

    expect(params.rId).toBe('123');
    expect(params.tId).toBe('456');
    expect(params.kindParam).toBe('2');
    expect(params.name).toBe('test');
  });

  it('should never return undefined for kindParam', () => {
    (window as any).location.search = '?rId=123';
    const params = getUrlParams();

    expect(params.kindParam).toBeDefined();
    expect(params.kindParam).not.toBeNull();
    expect(typeof params.kindParam).toBe('string');
  });

  it('should support both "kind" and "type" parameters', () => {
    (window as any).location.search = '?rId=123&type=3';
    const params = getUrlParams();

    expect(params.kindParam).toBe('3');
  });

  it('should prefer "kind" over "type" parameter', () => {
    (window as any).location.search = '?rId=123&kind=2&type=3';
    const params = getUrlParams();

    expect(params.kindParam).toBe('2');
  });
});

describe('getAnnotationType', () => {
  it('should return correct annotation type for kind=1', () => {
    expect(getAnnotationType('1')).toBe('classification');
  });

  it('should return correct annotation type for kind=2', () => {
    expect(getAnnotationType('2')).toBe('qa');
  });

  it('should return correct annotation type for kind=3', () => {
    expect(getAnnotationType('3')).toBe('ranking');
  });

  it('should return entity-relation for kind=4', () => {
    expect(getAnnotationType('4')).toBe('entity-relation');
  });

  it('should return entity-relation for unknown kind', () => {
    expect(getAnnotationType('unknown')).toBe('entity-relation');
  });

  it('should never return undefined', () => {
    const result = getAnnotationType('');
    expect(result).toBeDefined();
    expect(result).not.toBeNull();
  });
});

