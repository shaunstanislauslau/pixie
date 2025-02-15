/*
 * Copyright 2018- The Pixie Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package utils_test

import (
	"testing"

	"github.com/dgrijalva/jwt-go/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"px.dev/pixie/src/shared/services/jwtpb"
	"px.dev/pixie/src/shared/services/utils"
)

func TestPBToMapClaims_User(t *testing.T) {
	p := &jwtpb.JWTClaims{
		Audience:  "audience",
		ExpiresAt: 100,
		JTI:       "jti",
		IssuedAt:  15,
		Issuer:    "issuer",
		NotBefore: 5,
		Subject:   "subject",
		Scopes:    []string{"user"},
	}

	// User claims.
	userClaims := &jwtpb.UserJWTClaims{
		UserID:    "user_id",
		OrgID:     "org_id",
		Email:     "user@email.com",
		IsAPIUser: false,
	}
	p.CustomClaims = &jwtpb.JWTClaims_UserClaims{
		UserClaims: userClaims,
	}

	claims := utils.PBToMapClaims(p)
	assert.Equal(t, "audience", claims["aud"])
	assert.Equal(t, int64(100), claims["exp"])
	assert.Equal(t, "jti", claims["jti"])
	assert.Equal(t, int64(15), claims["iat"])
	assert.Equal(t, "issuer", claims["iss"])
	assert.Equal(t, int64(5), claims["nbf"])
	assert.Equal(t, "subject", claims["sub"])

	assert.Equal(t, "user", claims["Scopes"])
	assert.Equal(t, "user_id", claims["UserID"])
	assert.Equal(t, "org_id", claims["OrgID"])
	assert.Equal(t, "user@email.com", claims["Email"])
	assert.Equal(t, false, claims["IsAPIUser"])
}

func TestPBToMapClaims_Service(t *testing.T) {
	p := &jwtpb.JWTClaims{
		Audience:  "audience",
		ExpiresAt: 100,
		JTI:       "jti",
		IssuedAt:  15,
		Issuer:    "issuer",
		NotBefore: 5,
		Subject:   "subject",
		Scopes:    []string{"service"},
	}

	// Service claims.
	svcClaims := &jwtpb.ServiceJWTClaims{
		ServiceID: "service_id",
	}
	p.CustomClaims = &jwtpb.JWTClaims_ServiceClaims{
		ServiceClaims: svcClaims,
	}

	claims := utils.PBToMapClaims(p)
	assert.Equal(t, "audience", claims["aud"])
	assert.Equal(t, int64(100), claims["exp"])
	assert.Equal(t, "jti", claims["jti"])
	assert.Equal(t, int64(15), claims["iat"])
	assert.Equal(t, "issuer", claims["iss"])
	assert.Equal(t, int64(5), claims["nbf"])
	assert.Equal(t, "subject", claims["sub"])

	assert.Equal(t, "service", claims["Scopes"])
	assert.Equal(t, "service_id", claims["ServiceID"])
}

func TestPBToMapClaims_Cluster(t *testing.T) {
	p := &jwtpb.JWTClaims{
		Audience:  "audience",
		ExpiresAt: 100,
		JTI:       "jti",
		IssuedAt:  15,
		Issuer:    "issuer",
		NotBefore: 5,
		Subject:   "subject",
		Scopes:    []string{"cluster"},
	}

	// Cluster claims.
	clusterClaims := &jwtpb.ClusterJWTClaims{
		ClusterID: "cluster_id",
	}
	p.CustomClaims = &jwtpb.JWTClaims_ClusterClaims{
		ClusterClaims: clusterClaims,
	}

	claims := utils.PBToMapClaims(p)
	assert.Equal(t, "audience", claims["aud"])
	assert.Equal(t, int64(100), claims["exp"])
	assert.Equal(t, "jti", claims["jti"])
	assert.Equal(t, int64(15), claims["iat"])
	assert.Equal(t, "issuer", claims["iss"])
	assert.Equal(t, int64(5), claims["nbf"])
	assert.Equal(t, "subject", claims["sub"])

	assert.Equal(t, "cluster", claims["Scopes"])
	assert.Equal(t, "cluster_id", claims["ClusterID"])
}

func TestGetClaimsType(t *testing.T) {
	p := &jwtpb.JWTClaims{
		Audience:  "audience",
		ExpiresAt: 100,
		JTI:       "jti",
		IssuedAt:  15,
		Issuer:    "issuer",
		NotBefore: 5,
		Subject:   "subject",
		Scopes:    []string{"user"},
	}

	// User claims.
	userClaims := &jwtpb.UserJWTClaims{
		UserID: "user_id",
		OrgID:  "org_id",
		Email:  "user@email.com",
	}
	p.CustomClaims = &jwtpb.JWTClaims_UserClaims{
		UserClaims: userClaims,
	}

	assert.Equal(t, utils.UserClaimType, utils.GetClaimsType(p))
}

func TestMapClaimsToPB_User(t *testing.T) {
	claims := jwt.MapClaims{}

	// Standard claims.
	claims["aud"] = "audience"
	claims["exp"] = 100.0
	claims["jti"] = "jti"
	claims["iat"] = 15.0
	claims["iss"] = "issuer"
	claims["nbf"] = 5.0
	claims["sub"] = "subject"

	claims["Scopes"] = "user"
	claims["UserID"] = "user_id"
	claims["OrgID"] = "org_id"
	claims["Email"] = "user@email.com"
	claims["IsAPIUser"] = false

	pb, err := utils.MapClaimsToPB(claims)
	require.NoError(t, err)
	assert.Equal(t, "audience", pb.Audience)
	assert.Equal(t, int64(100), pb.ExpiresAt)
	assert.Equal(t, "jti", pb.JTI)
	assert.Equal(t, int64(15), pb.IssuedAt)
	assert.Equal(t, "issuer", pb.Issuer)
	assert.Equal(t, int64(5), pb.NotBefore)
	assert.Equal(t, "subject", pb.Subject)
	assert.Equal(t, []string{"user"}, pb.Scopes)

	customClaims := pb.GetUserClaims()
	assert.Equal(t, "user_id", customClaims.UserID)
	assert.Equal(t, "org_id", customClaims.OrgID)
	assert.Equal(t, "user@email.com", customClaims.Email)
	assert.Equal(t, false, customClaims.IsAPIUser)
}

func TestMapClaimsToPB_Service(t *testing.T) {
	claims := jwt.MapClaims{}

	// Standard claims.
	claims["aud"] = "audience"
	claims["exp"] = 100.0
	claims["jti"] = "jti"
	claims["iat"] = 15.0
	claims["iss"] = "issuer"
	claims["nbf"] = 5.0
	claims["sub"] = "subject"

	claims["Scopes"] = "service"
	claims["ServiceID"] = "service_id"

	pb, err := utils.MapClaimsToPB(claims)
	require.NoError(t, err)
	assert.Equal(t, "audience", pb.Audience)
	assert.Equal(t, int64(100), pb.ExpiresAt)
	assert.Equal(t, "jti", pb.JTI)
	assert.Equal(t, int64(15), pb.IssuedAt)
	assert.Equal(t, "issuer", pb.Issuer)
	assert.Equal(t, int64(5), pb.NotBefore)
	assert.Equal(t, "subject", pb.Subject)
	assert.Equal(t, []string{"service"}, pb.Scopes)

	customClaims := pb.GetServiceClaims()
	assert.Equal(t, "service_id", customClaims.ServiceID)
}

func TestMapClaimsToPB_Cluster(t *testing.T) {
	claims := jwt.MapClaims{}

	// Standard claims.
	claims["aud"] = "audience"
	claims["exp"] = 100.0
	claims["jti"] = "jti"
	claims["iat"] = 15.0
	claims["iss"] = "issuer"
	claims["nbf"] = 5.0
	claims["sub"] = "subject"

	claims["Scopes"] = "cluster"
	claims["ClusterID"] = "cluster_id"

	pb, err := utils.MapClaimsToPB(claims)
	require.NoError(t, err)
	assert.Equal(t, "audience", pb.Audience)
	assert.Equal(t, int64(100), pb.ExpiresAt)
	assert.Equal(t, "jti", pb.JTI)
	assert.Equal(t, int64(15), pb.IssuedAt)
	assert.Equal(t, "issuer", pb.Issuer)
	assert.Equal(t, int64(5), pb.NotBefore)
	assert.Equal(t, "subject", pb.Subject)
	assert.Equal(t, []string{"cluster"}, pb.Scopes)

	customClaims := pb.GetClusterClaims()
	assert.Equal(t, "cluster_id", customClaims.ClusterID)
}

func TestMapClaimsToPB_Fail(t *testing.T) {
	claims := jwt.MapClaims{}

	// Standard claims.
	claims["aud"] = "audience"
	claims["exp"] = "12345"
	claims["jti"] = "jti"
	claims["iat"] = 15.0
	claims["iss"] = "issuer"
	claims["nbf"] = 5.0
	claims["sub"] = "subject"

	claims["Scopes"] = "cluster"
	claims["ClusterID"] = "cluster_id"

	_, err := utils.MapClaimsToPB(claims)
	assert.NotNil(t, err)
}
