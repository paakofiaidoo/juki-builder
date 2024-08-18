package services

import "github.com/paakofiaidoo/juki/engine/data/repositories"

/* ============================================
*			Services
* ============================================*/

type Service interface {
}

type service struct {
	repository repositories.Repository
}

/* ============================================
*			Service Constructors
* ============================================*/

func NewService(
	repository repositories.Repository,

) Service {
	return &service{
		repository: repository,
	}
}
